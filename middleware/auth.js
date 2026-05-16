

const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant ou invalide' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide';
    return res.status(401).json({ success: false, message: msg });
  }
};


const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé — permissions insuffisantes'
    });
  }
  next();
};

// Helper: déterminer statut présence
const determinerStatut = (heure) => {
  const limite_present = process.env.HEURE_LIMITE_PRESENT || '08:30:00';
  const limite_retard  = process.env.HEURE_LIMITE_RETARD  || '09:30:00';
  if (heure <= limite_present) return 'present';
  if (heure <= limite_retard)  return 'retard';
  return 'absent';
};

module.exports = { requireAuth, requireRole, determinerStatut };