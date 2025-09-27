// Servidor Express adaptado para SPA y compatibilidad móvil/navegadores
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
// Estado online/offline (persistente en memoria para demo, usar DB para producción)
let portfolioOnline = false;

// Middleware para parsear JSON
app.use(express.json());

// API: obtener estado actual
app.get('/api/portfolio-status', (req, res) => {
  res.json({ online: portfolioOnline });
});

// API: cambiar estado (requiere contraseña)
app.post('/api/portfolio-status', (req, res) => {
  const { password } = req.body;
  // Contraseña segura desde variable de entorno
  const correct = password && password === process.env.PORTFOLIO_SECRET;
  if (!correct) {
    return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
  }
  portfolioOnline = !portfolioOnline;
  res.json({ success: true, online: portfolioOnline });
});

// Servir archivos estáticos correctamente
app.use(express.static(path.join(__dirname)));

// Para cualquier ruta que no sea archivo real, devolver index.html (SPA fix)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
