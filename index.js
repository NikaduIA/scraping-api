const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let puppeteer;
let chromium;

if (process.env.RENDER) {
    // Entorno Render
    puppeteer = require('puppeteer-core');
    chromium = require('chrome-aws-lambda');
} else {
    // Entorno local
    puppeteer = require('puppeteer');
}

app.get('/consulta', async (req, res) => {
    const { nombre, tipo, vigente } = req.query;

    if (!nombre || !tipo || !vigente) {
        return res.status(400).send({ error: 'Faltan parámetros requeridos: nombre, tipo y vigente' });
    }

    try {
        const browser = await puppeteer.launch(process.env.RENDER ? {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        } : {
            headless: true
        });

        const page = await browser.newPage();
        await page.goto('https://consultaprocesos.ramajudicial.gov.co/Procesos/NombreRazonSocial', {
            waitUntil: 'networkidle2'
        });

        // Selección de Tipo de Persona
        await page.select('select#tipoPersona', tipo); // Asegúrate que este sea el selector correcto

        // Ingreso de Nombre
        await page.type('input#input-78', nombre);

        // Selección de vigencia si aplica (esto depende de cómo esté implementado, valida el selector)
        if (vigente === 'true') {
            await page.click('input#vigenteCheck'); // Ajusta el selector si es necesario
        }

        await page.click('button[aria-label="Consultar por nombre o razón social"]');
        await page.waitForTimeout(5000);

        const content = await page.content();
        await browser.close();

        res.send(content);

    } catch (error) {
        console.error('Error al consultar:', error);
        res.status(500).send({ error: 'Ocurrió un error al consultar los procesos', detalle: error.message });
    }
});

app.get('/consulta', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
