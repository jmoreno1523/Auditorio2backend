const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/:nombre', async (req, res) => {
  const nombre = req.params.nombre;

  try {
    // Asegurarse de que la conexión esté lista
    await mongoose.connection.asPromise();

    // Conectarse a la base de datos "Edificios"
    const db = mongoose.connection.useDb('Edificios');
    const nativeDb = db.db; // Asegurado ahora que la conexión está lista

    // Verificar si nativeDb está definido
    if (!nativeDb) {
      return res.status(500).json({ error: 'No se pudo acceder al driver nativo de MongoDB.' });
    }

    // Listar todas las colecciones
    const colecciones = await nativeDb.listCollections().toArray();

    const existe = colecciones.some(c => c.name === nombre);
    if (!existe) {
      return res.status(400).json({ error: `La colección "${nombre}" no existe.` });
    }

    const coleccion = nativeDb.collection(nombre);
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
