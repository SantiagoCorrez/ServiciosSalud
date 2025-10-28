// index.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');

// Middlewares
app.use(cors()); // Habilita CORS para permitir peticiones desde Angular
app.use(express.json()); // Permite al servidor entender JSON

// Servir archivos estáticos de Angular
app.use(express.static(path.join(__dirname, 'public')));

// Importar modelos para que Sequelize los conozca
require('./models/User');
require('./models/HealthRegion');
require('./models/Municipality');
require('./models/Service');
require('./models/Bed');
require('./models/Sede');
require('./models/SedeService')
require('./models/Service');
require('./models/BedType');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bed-types', require('./routes/bedTypeRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/health-regions', require('./routes/healthRegionRoutes'));
app.use('/api/municipalities', require('./routes/municipalityRoutes'));
app.use('/api/sedes', require('./routes/sedeRoutes'));
app.use('/api/public', require('./routes/publicRoutes')); // Rutas públicas, sin protección

// The "catchall" handler: for any request that doesn't
// match one above, send back index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Sincronizar con la base de datos y levantar el servidor
async function startServer() {
    try {
        // `force: false` para no borrar los datos en cada reinicio
        await sequelize.sync({ force: false });
        console.log('Conexión a la base de datos establecida correctamente.');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

startServer();