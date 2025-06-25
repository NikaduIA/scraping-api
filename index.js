const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/consulta', async (req, res) => {
    const nombre = req.query.nombre;
    const tipo = req.query.tipo || 'nat'; // 'nat' por defecto si no lo envían
    const vigente = req.query.vigente === 'true' ? 'true' : 'false';

    if (!nombre) {
        return res.status(400).send({ error: 'Falta el parámetro ?nombre=' });
    }

    const apiUrl = `https://consultaprocesos.ramajudicial.gov.co:448/api/v2/Procesos/Consulta/NombreRazonSocial?nombre=${encodeURIComponent(nombre)}&tipoPersona=${tipo}&SoloActivos=${vigente}&codificacionDespacho=&pagina=1`;

    try {
        const response = await axios.get(apiUrl);
        res.send(response.data);
    } catch (error) {
        console.error('Error al consultar la API:', error.message);
        res.status(500).send({ error: 'Ocurrió un error al consultar los procesos', detalle: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
