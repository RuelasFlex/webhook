import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import XlsxPopulate from 'xlsx-populate';
import { faker } from '@faker-js/faker';

//Servidor
const app = express();
const port = 3007;

app.use(bodyParser.json());

/* app.post('/webhook', async (req, res) => {
    try {
        const orderData = req.body;

        // Aqui guardar la orden en la base de datos
        //await saveOrder(orderData);

        // Aqui generar el excel
        let excelFile;
        if (Array.isArray(orderData)) {
            excelFile = await generateExcelForMultipleOrders(orderData);
        } else {
            excelFile = await generateExcelForSingleOrder(orderData);
        }

        // Aqui enviar el excel
        await sendEmail(excelFile);

        res.status(200).send('Orden recibida y procesada');
    } catch (error) {
        console.error('Error procesando la orden:', error);
        res.status(500).send('Error procesando la orden');
    }
}); */

app.post('/webhook', async (req, res) => {
    try {
        let orderData = req.body;

        // Si no hay datos en el body, generar datos aleatorios para pruebas
        if (!orderData || Object.keys(orderData).length === 0) {
            orderData = generateMultipleRandomOrders(5); // Genera 5 órdenes aleatorias
            console.log('Generando datos aleatorios para prueba...');
        }

        // Aqui guardar la orden en la base de datos (simulado)
        //Sawait saveOrder(orderData);

        // Aqui generar el excel
        let excelFile;
        if (Array.isArray(orderData)) {
            excelFile = await generateExcelForMultipleOrders(orderData);
        } else {
            excelFile = await generateExcelForSingleOrder(orderData);
        }

        // Aqui enviar el excel
        await sendEmail(excelFile);

        res.status(200).send('Orden recibida y procesada');
    } catch (error) {
        console.error('Error procesando la orden:', error);
        res.status(500).send('Error procesando la orden');
    }
});

app.get('/generate-test-orders', async (req, res) => {
    try {
        const orderData = generateMultipleRandomOrders(5); // Genera 5 órdenes aleatorias

        // Genera el Excel
        const excelFile = await generateExcelForMultipleOrders(orderData);

        // Envía el Excel
        await sendEmail(excelFile);

        res.status(200).send('Órdenes de prueba generadas y procesadas');
    } catch (error) {
        console.error('Error procesando la orden de prueba:', error);
        res.status(500).send('Error procesando la orden de prueba');
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

//Configurar el envio del correo
async function sendEmail(excelFile) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'bryanruelas09@gmail.com',
            pass: 'atxctpiegwlfqqeg'
        }
    });

    let mailOptions = {
        from: 'bryanruelas09@gmail.com',
        to: 'sadata10@yahoo.com',
        subject: 'Ordenes Recibidas',
        text: 'Adjunto encontrarás el archivo con las órdenes recibidas.',
        attachments: [
            {
                filename: 'ordenes.xlsx',
                path: excelFile
            }
        ]
    };

    await transporter.sendMail(mailOptions);
}

async function generateExcelForSingleOrder(orderData) {
    // Crear un nuevo workbook
    const workbook = await XlsxPopulate.fromBlankAsync();

    // Seleccionar la primera hoja
    const sheet = workbook.sheet(0);

    // Obtener las claves del objeto orderData para usarlas como encabezados de columna
    const headers = Object.keys(orderData);

    // Agregar los encabezados de las columnas en la primera fila
    headers.forEach((header, index) => {
        sheet.cell(1, index + 1).value(header);
    });

    // Agregar los valores de orderData en la segunda fila
    headers.forEach((header, index) => {
        sheet.cell(2, index + 1).value(orderData[header]);
    });

    adjustColumnWidths(sheet, headers, [orderData]);

    const filePath = `./order-${orderData.id}.xlsx`;

    // Guardar el archivo Excel
    await workbook.toFileAsync(filePath);

    return filePath;
}

async function generateExcelForMultipleOrders(orders) {
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0);

    if (orders.length > 0) {
        const headers = Object.keys(orders[0]);

        // Agregar encabezados
        headers.forEach((header, index) => {
            sheet.cell(1, index + 1).value(header);
        });

        // Agregar cada orden como una fila
        orders.forEach((order, rowIndex) => {
            headers.forEach((header, colIndex) => {
                sheet.cell(rowIndex + 2, colIndex + 1).value(order[header]);
            });
        });
        adjustColumnWidths(sheet, headers, orders);
    }

    const filePath = `./orders.xlsx`;
    await workbook.toFileAsync(filePath);

    return filePath;
}

//Generar datos falsos para el excel
function generateRandomOrder() {
    return {
        id: faker.datatype.uuid(),
        customerName: faker.name.fullName(),
        customerEmail: faker.internet.email(),
        orderDate: faker.date.past().toISOString(),
        orderAmount: faker.finance.amount(),
        orderStatus: faker.helpers.arrayElement(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
        shippingAddress: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zipCode: faker.address.zipCode()
    };
}

//Generar multiples datos falsos para el excel
function generateMultipleRandomOrders(count) {
    const orders = [];
    for (let i = 0; i < count; i++) {
        orders.push(generateRandomOrder());
    }
    return orders;
}

//Ajustar el ancho de las celdas
function adjustColumnWidths(sheet, headers, data) {
    headers.forEach((header, colIndex) => {
        // Encontrar el ancho máximo necesario para la columna
        let maxWidth = header.length;
        data.forEach(row => {
            const value = row[header] ? row[header].toString() : '';
            if (value.length > maxWidth) {
                maxWidth = value.length;
            }
        });
        // Ajustar el ancho de la columna, asegurando que el valor sea positivo y dentro del rango permitido
        const width = Math.max(maxWidth + 2, 10); // Asegura que el ancho sea al menos 10
        sheet.column(colIndex + 1).width(width);
    });
}

