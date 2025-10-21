// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- Función de Registro de Usuario ---
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Verificar si el email ya existe
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // 2. Crear el nuevo usuario (la contraseña se hashea automáticamente por el hook del modelo)
    user = await User.create({ name, email, password, role });

    // 3. Crear el Payload para el JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // 4. Firmar el Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Necesitaremos añadir esto a .env
      { expiresIn: '5h' }, // El token expira en 5 horas
      (error, token) => {
        if (error) throw error;
        res.status(201).json({ token }); // Devolver el token
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- Función de Inicio de Sesión (Login) ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales no válidas' });
    }

    // 2. Comparar la contraseña ingresada con la almacenada en la BD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales no válidas' });
    }

    // 3. Si todo es correcto, crear y firmar el token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (error, token) => {
        if (error) throw error;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};