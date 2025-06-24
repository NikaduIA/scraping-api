const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/consulta', async (req, res) => {
    const nombre = req.query.nombre;
    const tipo = req.query.tipo;
    const vigente = req.query.vigente;

    if (!nombre || !tipo || !vigente) {
        return res.status(400).send('Faltan parámetros requeridos: nombre, tipo o vigente');
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto('https://consultaprocesos.ramajudicial.gov.co/Procesos/NombreRazonSocial', {
            waitUntil: 'networkidle2'
        });

        // Seleccionar tipo de persona
        await page.waitForSelector('input#input-65');
        if (tipo === 'nat') {
            await page.click('input#input-65'); // Natural
        } else if (tipo === 'jur') {
            await page.click('input#input-66'); // Jurídica
        }

        // Escribir nombre
        await page.waitForSelector('input#input-78');
        await page.type('input#input-78', nombre);

        // Seleccionar vigente o todos
        if (vigente === 'true') {
            await page.click('input#input-88'); // Solo vigentes
        } else {
            await page.click('input#input-89'); // Todos los procesos
        }

        // Consultar
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

// Ruta básica para verificar si el servidor está corriendo
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
