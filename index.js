const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/consulta', async (req, res) => {
    const { nombre } = req.query;

    if (!nombre) {
        return res.status(400).json({ error: 'El parámetro "nombre" es obligatorio' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://consultaprocesos.ramajudicial.gov.co/Procesos/NombreRazonSocial');

        // Aquí deberías implementar la interacción con la página:
        console.log(`Buscando procesos para: ${nombre}`);

        await browser.close();

        res.json({ mensaje: `Consulta realizada para: ${nombre}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ocurrió un error al consultar los procesos' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
