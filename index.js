const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/consulta', async (req, res) => {
    const nombre = req.query.nombre;
    if (!nombre) return res.status(400).send('Falta el parámetro ?nombre=');

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.goto('https://consultaprocesos.ramajudicial.gov.co/Procesos/NombreRazonSocial', { waitUntil: 'networkidle2' });

        await page.waitForSelector('input#input-78');
        await page.type('input#input-78', nombre);

        await page.click('button[aria-label="Consultar por nombre o razón social"]');
        await page.waitForTimeout(5000); 

        const content = await page.content();
        await browser.close();

        res.send(content);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
