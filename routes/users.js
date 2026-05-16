// =====================================================
//  CArdPr — routes/users.js
//  GET    /api/users        → liste
//  GET    /api/users/:id    → un user
//  POST   /api/users        → créer
//  PUT    /api/users/:id    → modifier
//  DELETE /api/users/:id    → supprimer
// =====================================================

const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent auth
router.use(requireAuth);

// ─── LISTE ────────────────────────────────────────────
router.get('/', requireRole('admin', 'formateur'), async (req, res) => {
  try {
    let sql    = 'SELECT id, full_name, email, role, rfid_card, groupe, annee, avatar, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (req.query.role)   { sql += ' AND role = ?';                params.push(req.query.role); }
    if (req.query.groupe) { sql += ' AND groupe = ?';              params.push(req.query.groupe); }
    if (req.query.search) {
      sql += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    sql += ' ORDER BY role, full_name';

    const [users] = await db.execute(sql, params);

    const [[stats]] = await db.execute(
      "SELECT COUNT(*) as total, SUM(role='stagiaire') as stagiaires, SUM(role='formateur') as formateurs, SUM(status='actif') as actifs FROM users"
    );

    res.json({ success: true, message: 'OK', data: { users, stats } });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── UN USER ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [[user]] = await db.execute(
      'SELECT id, full_name, email, role, rfid_card, groupe, annee, avatar, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const [historique] = await db.execute(
      'SELECT date_point, heure, statut FROM pointages WHERE user_id = ? ORDER BY date_point DESC LIMIT 30',
      [id]
    );

    const [[statsPresence]] = await db.execute(
      `SELECT COUNT(*) as total_jours,
              SUM(statut='present') as presents,
              SUM(statut='retard')  as retards,
              SUM(statut='absent')  as absents,
              ROUND(SUM(statut IN ('present','retard')) / COUNT(*) * 100, 1) as taux_presence
       FROM pointages WHERE user_id = ?`,
      [id]
    );

    res.json({ success: true, message: 'OK', data: { ...user, historique, stats_presence: statsPresence } });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CRÉER ────────────────────────────────────────────
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { full_name, email, password, rfid_card, role, groupe, annee } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'full_name, email, password, role requis' });
    }

    if (!['admin', 'formateur', 'stagiaire'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    // Email unique
    const [[existing]] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ success: false, message: 'Email déjà utilisé' });

    // RFID unique
    if (rfid_card) {
      const [[existRfid]] = await db.execute('SELECT id FROM users WHERE rfid_card = ?', [rfid_card]);
      if (existRfid) return res.status(409).json({ success: false, message: 'Carte RFID déjà assignée' });
    }

    const hash   = await bcrypt.hash(password, 10);
    const words  = full_name.split(' ');
    const avatar = (words[0][0] + (words[1]?.[0] || '')).toUpperCase();

    const [result] = await db.execute(
      'INSERT INTO users (full_name, email, password, rfid_card, role, groupe, annee, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [full_name, email, hash, rfid_card || null, role, groupe || null, annee || null, avatar]
    );

    const [[newUser]] = await db.execute(
      'SELECT id, full_name, email, role, rfid_card, groupe, annee, avatar, status FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Utilisateur créé', data: newUser });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── MODIFIER ─────────────────────────────────────────
router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const id      = parseInt(req.params.id);
    const allowed = ['full_name', 'email', 'rfid_card', 'role', 'groupe', 'annee', 'status'];
    const fields  = [];
    const params  = [];

    for (const key of allowed) {
      if (key in req.body) {
        fields.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }

    if (req.body.password) {
      fields.push('password = ?');
      params.push(await bcrypt.hash(req.body.password, 10));
    }

    if (!fields.length) return res.status(400).json({ success: false, message: 'Aucun champ à modifier' });

    params.push(id);
    await db.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [[updated]] = await db.execute(
      'SELECT id, full_name, email, role, rfid_card, groupe, annee, avatar, status FROM users WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Utilisateur modifié', data: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SUPPRIMER ────────────────────────────────────────
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Impossible de supprimer votre propre compte' });
    }

    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    res.json({ success: true, message: 'Utilisateur supprimé', data: null });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;