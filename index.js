const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let puppeteer;
let chromium;

if (process.env.NODE_ENV === 'production') {
    puppeteer = require('puppeteer-core');
    chromium = require('chrome-aws-lambda');
} else {
    puppeteer = require('puppeteer');
}

app.get('/consulta', async (req, res) => {
    const nombre = req.query.nombre;
    const tipoPersona = req.query.tipo || 'nat';
    const tipoProceso = req.query.proceso || 'TODOS';
    const vigente = req.query.vigente || 'S';

    if (!nombre) {
        return res.status(400).send('Falta el parámetro ?nombre=');
    }

    try {
        const browser = await puppeteer.launch({
            args: chromium?.args || [],
            defaultViewport: chromium?.defaultViewport || null,
            executablePath: process.env.NODE_ENV === 'production' ? await chromium.executablePath : undefined,
            headless: true,
        });

        const page = await browser.newPage();
        await page.goto('https://consultaprocesos.ramajudicial.gov.co/Procesos/NombreRazonSocial', {
            waitUntil: 'networkidle2'
        });

        await page.waitForSelector('input#input-78'); // Nombre
        await page.type('input#input-78', nombre);

        await page.select('#tipoPersona', tipoPersona); // nat o jur
        await page.select('#tipoProceso', tipoProceso); // Ejemplo: TODOS
        await page.select('#vigente', vigente); // S o N

        await page.click('button[aria-label="Consultar por nombre o razón social"]');
        await page.waitForTimeout(5000);

        const content = await page.content();
        await browser.close();

        res.send(content);

    } catch (error) {
        console.error('Error al consultar:', error);
        res.status(500).send({ error: 'Ocurrió un error al consultar los procesos' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
