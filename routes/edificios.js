const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/:nombre', async (req, res) => {
  const nombre = req.params.nombre;

  try {
    const db = mongoose.connection.useDb('Edificios');
    const nativeDb = db.db; // Acceso a driver nativo Mongo

    // Obtener todas las colecciones
    const colecciones = await nativeDb.listCollections().toArray();

    // Verificar si la colección solicitada existe
    const existe = colecciones.some(c => c.name === nombre);
    if (!existe) {
      return res.status(400).json({ error: `La colección "${nombre}" no existe.` });
    }

    // Obtener la colección específica
    const coleccion = nativeDb.collection(nombre);

    // Buscar todos los documentos
    const auditorios = await coleccion.find({}).toArray();

    console.log("📦 Consultando colección:", nombre);
    console.log("📋 Resultados:", auditorios.length);

    res.json(auditorios);
  } catch (err) {
    console.error('❌ Error al obtener auditorios:', err.message);
    res.status(500).json({ error: 'No se pudo obtener la colección.' });
  }
});

module.exports = router;


