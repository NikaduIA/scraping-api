const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const isRender = process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.RENDER;

app.get('/consulta', async (req, res) => {
    const nombre = req.query.nombre;
    if (!nombre) {
        return res.status(400).send({ error: 'Falta el parámetro ?nombre=' });
    }

    try {
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: isRender ? await chromium.executablePath : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            headless: true,
        });

        const page = await browser.newPage();

        console.log('Navegador y página iniciados, cargando sitio...');
        
        await page.goto('https://consultaprocesos.ramajudicial.gov.co/Procesos/NombreRazonSocial', { waitUntil: 'networkidle2' });
        
        console.log('Sitio cargado, interactuando...');
        
        await page.waitForSelector('input#input-78');
        await page.type('input#input-78', nombre);
        await page.click('button[aria-label="Consultar por nombre o razón social"]');
        await page.waitForTimeout(5000);

        const content = await page.content();
        await browser.close();

        console.log('Proceso completado, enviando contenido.');
        res.send(content);

    } catch (error) {
        console.error('Error al consultar:', error);
        res.status(500).send({ error: 'Ocurrió un error al consultar los procesos', detalle: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
