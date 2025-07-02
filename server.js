// Servidor Express adaptado para SPA y compatibilidad móvil/navegadores
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos correctamente
app.use(express.static(path.join(__dirname)));

// Para cualquier ruta que no sea archivo real, devolver index.html (SPA fix)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
