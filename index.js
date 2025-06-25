const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/consulta', async (req, res) => {
    const nombre = req.query.nombre;
    const tipoPersona = req.query.tipo;
    const vigente = req.query.vigente;

    if (!nombre || !tipoPersona || vigente === undefined) {
        return res.status(400).json({ error: 'Faltan parámetros: nombre, tipo o vigente' });
    }

    try {
        const apiUrl = `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Procesos/Consulta/NombreRazonSocial?nombre=${encodeURIComponent(nombre)}&tipoPersona=${tipoPersona}&SoloActivos=${vigente}&codificacionDespacho=&pagina=1`;

        const respuesta = await axios.get(apiUrl);

        res.json(respuesta.data);

    } catch (error) {
        console.error('Error al consultar:', error);
        res.status(500).json({
            error: 'Ocurrió un error al consultar los procesos',
            detalle: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
