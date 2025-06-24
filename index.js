const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/consulta', async (req, res) => {
    const nombre = req.query.nombre;
    if (!nombre) {
        return res.status(400).send('Falta el parámetro ?nombre=');
    }

    try {
        // Detecta si estamos en Render o en Local
        const isRender = process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.RENDER;

        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: isRender ? await chromium.executablePath : path.resolve('C:/Program Files/Google/Chrome/Application/chrome.exe'),
            headless: chromium.headless,
        });

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
        res.status(500).send({
            error: 'Ocurrió un error al consultar los procesos',
            detalle: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
