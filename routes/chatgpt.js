const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  const { pregunta } = req.body;

  try {
    if (!pregunta) {
      return res.status(400).json({ error: 'Falta la pregunta en la solicitud.' });
    }

    const db = mongoose.connection.useDb('Edificios');
    const nativeDb = db.db;

    const colecciones = await nativeDb.listCollections().toArray();
    const nombresEdificios = colecciones.map(c => c.name);

    const edificiosYSalones = {};
    for (const edificio of nombresEdificios) {
      const coleccion = nativeDb.collection(edificio);
      const salones = await coleccion.find({}).toArray();
      edificiosYSalones[edificio] = salones.map(salon => ({
        nombre: salon.nombre,
        capacidad: salon.capacidad,
        caracteristicas: salon.caracteristicas || '',
        piso: salon.piso,
        tipoAula: salon.tipo_aula
      }));
    }
    console.log("Edificios y salones:", edificiosYSalones);

    let contexto = 'Eres un asistente experto en la gestión de salones de una universidad.\n';
    contexto += 'Estos son los edificios y salones disponibles con sus características:\n\n';

    for (const [edificio, salones] of Object.entries(edificiosYSalones)) {
      contexto += `Edificio: ${edificio}\n`;
      if (salones.length === 0) {
        contexto += '  (No hay salones registrados)\n';
      } else {
        salones.forEach((s, i) => {
          contexto += `  ${i + 1}. ${s.nombre} - Capacidad: ${s.capacidad} personas`;
          if (s.caracteristicas) contexto += ` | Características: ${s.caracteristicas}`;
          contexto += '\n';
        });
      }
      contexto += '\n';
    }

    contexto += `Pregunta del usuario: "${pregunta}"\n`;
    contexto += 'Responde de forma clara y útil, basándote en la información de los edificios y salones.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente de gestión de salones universitarios.' },
        { role: 'user', content: contexto }
      ],
      temperature: 0.7,
      max_tokens: 700,
    });

    const respuesta = completion.choices[0].message.content;

    res.json({ respuesta });

  } catch (err) {
    console.error('❌ Error en el chatbot:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
