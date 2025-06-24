const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let puppeteer;
let chromium;

if (process.env.AWS_EXECUTION_ENV || process.env.IS_RENDER) {
    // Entorno de Render o AWS
    puppeteer = require('puppeteer-core');
    chromium = require('chrome-aws-lambda');
} else {
    // Entorno local
    puppeteer = require('puppeteer');
}

app.get('/consulta', async (req, res) => {
    const nombre = req.query.nombre;
    if (!nombre) {
        return res.status(400).send('Falta el parámetro ?nombre=');
    }

    try {
        const launchOptions = {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        };

        if (chromium) {
            launchOptions.args = chromium.args;
            launchOptions.defaultViewport = chromium.defaultViewport;
            launchOptions.executablePath = await chromium.executablePath;
            launchOptions.headless = chromium.headless;
        }

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        await page.goto('https://consultaprocesos.ramajudicial.gov.co/Procesos/NombreRazonSocial', {
            waitUntil: 'networkidle2'
        });

        await page.waitForSelector('input#input-78');
        await page.type('input#input-78', nombre);
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
