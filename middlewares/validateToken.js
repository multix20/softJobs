import jwt from 'jsonwebtoken';

export const validarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guardar los datos del token en req.user
    next(); // Pasar al siguiente middleware o controlador
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
