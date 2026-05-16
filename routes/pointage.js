// =====================================================
//  CArdPr — routes/pointage.js
//  POST /api/pointage/scan       → scan RFID
//  GET  /api/pointage/today      → présences aujourd'hui
//  GET  /api/pointage/history    → historique
//  POST /api/pointage/manual     → pointage manuel
// =====================================================

const express = require('express');
const db      = require('../config/db');
const { requireAuth, requireRole, determinerStatut } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ─── SCAN RFID ────────────────────────────────────────
router.post('/scan', async (req, res) => {
  try {
    const { rfid_card } = req.body;
    if (!rfid_card) return res.status(400).json({ success: false, message: 'Carte RFID requise' });

    const today = new Date().toISOString().split('T')[0];
    const now   = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    // Trouver user par RFID
    const [[user]] = await db.execute(
      "SELECT id, full_name, role, groupe, avatar FROM users WHERE rfid_card = ? AND status = 'actif'",
      [rfid_card]
    );

    if (!user) return res.status(404).json({ success: false, message: 'Carte RFID non reconnue' });

    // Déjà pointé aujourd'hui?
    const [[existing]] = await db.execute(
      'SELECT id, heure, statut FROM pointages WHERE user_id = ? AND date_point = ?',
      [user.id, today]
    );

    if (existing) {
      return res.json({
        success: true,
        message: `Déjà pointé aujourd'hui à ${existing.heure}`,
        data: { user, already_done: true, heure: existing.heure, statut: existing.statut }
      });
    }

    const statut = determinerStatut(now);

    await db.execute(
      'INSERT INTO pointages (user_id, rfid_card, date_point, heure, statut) VALUES (?, ?, ?, ?, ?)',
      [user.id, rfid_card, today, now, statut]
    );

    res.status(201).json({
      success: true,
      message: 'Pointage enregistré',
      data: { user, already_done: false, heure: now, statut, date: today }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── AUJOURD'HUI ──────────────────────────────────────
router.get('/today', async (req, res) => {
  try {
    const today  = new Date().toISOString().split('T')[0];
    let sql      = `SELECT p.id, p.heure, p.statut, p.date_point,
                          u.id as user_id, u.full_name, u.role, u.groupe, u.avatar, u.rfid_card
                   FROM pointages p JOIN users u ON u.id = p.user_id
                   WHERE p.date_point = ?`;
    const params = [today];

    if (req.query.role)   { sql += ' AND u.role = ?';   params.push(req.query.role); }
    if (req.query.groupe) { sql += ' AND u.groupe = ?'; params.push(req.query.groupe); }
    sql += ' ORDER BY p.heure DESC';

    const [pointages] = await db.execute(sql, params);

    const [[stats]] = await db.execute(
      `SELECT COUNT(*) as total_pointes,
              SUM(statut='present') as presents,
              SUM(statut='retard')  as retards,
              SUM(statut='absent')  as absents,
              (SELECT COUNT(*) FROM users WHERE status='actif' AND role != 'admin') as total_inscrits
       FROM pointages WHERE date_point = ?`,
      [today]
    );

    res.json({ success: true, message: 'OK', data: { date: today, pointages, stats } });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── HISTORIQUE ───────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    let sql    = `SELECT p.id, p.date_point, p.heure, p.statut,
                        u.id as user_id, u.full_name, u.role, u.groupe, u.avatar
                 FROM pointages p JOIN users u ON u.id = p.user_id WHERE 1=1`;
    const params = [];

    // Stagiaire: ses données seulement
    if (req.user.role === 'stagiaire') {
      sql += ' AND p.user_id = ?'; params.push(req.user.id);
    } else {
      if (req.query.user_id)   { sql += ' AND p.user_id = ?';    params.push(parseInt(req.query.user_id)); }
      if (req.query.role)      { sql += ' AND u.role = ?';       params.push(req.query.role); }
      if (req.query.statut)    { sql += ' AND p.statut = ?';     params.push(req.query.statut); }
      if (req.query.date_debut){ sql += ' AND p.date_point >= ?';params.push(req.query.date_debut); }
      if (req.query.date_fin)  { sql += ' AND p.date_point <= ?';params.push(req.query.date_fin); }
    }

    sql += ' ORDER BY p.date_point DESC, p.heure DESC';

    const page   = Math.max(1, parseInt(req.query.page  || 1));
    const limit  = Math.min(100, parseInt(req.query.limit || 20));
    const offset = (page - 1) * limit;

    const [all]  = await db.execute(sql, params);
    const total  = all.length;

    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    const [pointages] = await db.execute(sql, params);

    res.json({
      success: true,
      message: 'OK',
      data: {
        pointages,
        pagination: { total, page, limit, total_pages: Math.ceil(total / limit) }
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── MANUEL ───────────────────────────────────────────
router.post('/manual', requireRole('admin', 'formateur'), async (req, res) => {
  try {
    const { user_id, date, statut, heure, note } = req.body;

    if (!user_id || !date || !statut) {
      return res.status(400).json({ success: false, message: 'user_id, date et statut requis' });
    }

    if (!['present', 'retard', 'absent'].includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const [[user]] = await db.execute('SELECT id, rfid_card FROM users WHERE id = ?', [user_id]);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const heureVal = heure || new Date().toTimeString().split(' ')[0];

    await db.execute(
      `INSERT INTO pointages (user_id, rfid_card, date_point, heure, statut, note)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE heure=VALUES(heure), statut=VALUES(statut), note=VALUES(note)`,
      [user_id, user.rfid_card || 'MANUAL', date, heureVal, statut, note || 'Pointage manuel']
    );

    res.status(201).json({
      success: true,
      message: 'Pointage enregistré',
      data: { user_id, date, heure: heureVal, statut }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;