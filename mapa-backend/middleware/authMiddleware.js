// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware principal para autenticar el token
exports.protect = (req, res, next) => {
  // 1. Obtener el token del header
  const token = req.header('x-auth-token');

  // 2. Chequear si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso no válido' });
  }

  // 3. Verificar el token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Añadir el usuario del payload a la request para usarlo en otras rutas
    req.user = decoded.user;
    next(); // El token es válido, continuar al siguiente middleware o controlador
  } catch (error) {
    res.status(401).json({ msg: 'Token no es válido' });
  }
};

// Middleware para autorizar roles específicos (en este caso, 'admin')
exports.isAdmin = (req, res, next) => {
    // Se asume que este middleware se usa DESPUÉS de `protect`
    if (req.user && req.user.role === 'admin') {
        next(); // El usuario es admin, continuar
    } else {
        res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};