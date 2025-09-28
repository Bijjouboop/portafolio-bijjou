// Servidor Express adaptado para SPA y compatibilidad móvil/navegadores
require('dotenv').config();
const express = require('express');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const app = express();

// Inicializar base de datos SQLite
const dbPath = path.join(__dirname, 'accesos.db');
const dbExists = fs.existsSync(dbPath);
const db = new sqlite3.Database(dbPath);
if (!dbExists) {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS accesos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      user_agent TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

const PORT = process.env.PORT || 3000;

// Estado online/offline persistente en SQLite
function getPortfolioOnline(cb) {
  db.get('SELECT valor FROM config WHERE clave = ? LIMIT 1', ['online'], (err, row) => {
    if (err || !row) return cb(false);
    cb(row.valor === '1');
  });
}
function setPortfolioOnline(online, cb) {
  db.run('INSERT OR REPLACE INTO config (clave, valor) VALUES (?, ?)', ['online', online ? '1' : '0'], cb);
}
// Crear tabla config si no existe y asegurar que el valor por defecto sea online (1)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS config (
    clave TEXT PRIMARY KEY,
    valor TEXT
  )`);
  // Si no existe el valor, ponerlo en 1 (online)
  db.get('SELECT valor FROM config WHERE clave = ? LIMIT 1', ['online'], (err, row) => {
    if (!row) {
      db.run('INSERT INTO config (clave, valor) VALUES (?, ?)', ['online', '1']);
    }
  });
});


// Middleware para parsear JSON
app.use(express.json());

// Middleware para registrar IPs y datos de acceso
app.use((req, res, next) => {
  // No registrar peticiones a archivos estáticos ni a la API de estado
  if (!req.path.startsWith('/api/portfolio-status') && !req.path.match(/\.(js|css|png|jpg|svg|ico|xml|txt)$/)) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    db.run('INSERT INTO accesos (ip, user_agent) VALUES (?, ?)', [ip, userAgent]);
  }
  next();
});


// API: consultar accesos guardados (requiere clave admin por query param ?key=...)
app.get('/api/accesos', (req, res) => {
  const key = req.query.key;
  if (!key || key !== process.env.PORTFOLIO_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  db.all('SELECT * FROM accesos ORDER BY fecha DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error DB' });
    res.json(rows);
  });
});

// API: exportar accesos como CSV (requiere clave admin por query param ?key=...)
app.get('/api/accesos.csv', (req, res) => {
  const key = req.query.key;
  if (!key || key !== process.env.PORTFOLIO_SECRET) {
    return res.status(401).send('No autorizado');
  }
  db.all('SELECT * FROM accesos ORDER BY fecha DESC', [], (err, rows) => {
    if (err) return res.status(500).send('Error DB');
    let csv = 'id,ip,user_agent,fecha\n';
    rows.forEach(r => {
      // Escapar comillas y separar por comas
      csv += `${r.id},"${(r.ip||'').replace(/"/g,'""')}","${(r.user_agent||'').replace(/"/g,'""')}",${r.fecha}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="accesos.csv"');
    res.send(csv);
  });
});


// API: obtener estado actual
app.get('/api/portfolio-status', (req, res) => {
  getPortfolioOnline(online => {
    res.json({ online });
  });
});

// API: cambiar estado (requiere contraseña)
app.post('/api/portfolio-status', (req, res) => {
  const { password } = req.body;
  const correct = password && password === process.env.PORTFOLIO_SECRET;
  if (!correct) {
    return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
  }
  getPortfolioOnline(current => {
    const newState = !current;
    setPortfolioOnline(newState, err => {
      if (err) return res.status(500).json({ success: false, message: 'Error al guardar.' });
      res.json({ success: true, online: newState });
    });
  });
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
