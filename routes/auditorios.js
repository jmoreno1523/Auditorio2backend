// 📁 routes/auditorios.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Ruta: GET /api/auditorios
router.get('/', async (req, res) => {
  try {
    const db = mongoose.connection.useDb('Edificios'); // ✅ sin ".db"

    const colecciones = await db.listCollections().toArray();

    if (colecciones.length === 0) {
      return res.status(404).json({ error: 'No se encontraron colecciones (edificios).' });
    }

    let auditorios = [];

    for (const col of colecciones) {
      const docs = await db.collection(col.name).find().toArray();
      auditorios.push(...docs.map(doc => ({
        ...doc,
        edificio: col.name
      })));
    }

    if (auditorios.length === 0) {
      return res.status(404).json({ error: 'No se encontraron auditorios.' });
    }

    res.json(auditorios);

  } catch (error) {
    console.error('❌ Error al obtener auditorios:', error);
    res.status(500).json({ error: 'Error al obtener auditorios' });
  }
});

module.exports = router;
