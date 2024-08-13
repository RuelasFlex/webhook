// database.js
import sqlite3 from 'sqlite3';
import path from 'path';

class Database {
    constructor() {
        const dbPath = path.resolve(__dirname, 'orders.db');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error al conectar a la base de datos:', err.message);
            } else {
                console.log('Conectado a la base de datos SQLite.');
            }
        });

        this.createTable();
    }

    createTable() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                date TEXT NOT NULL
            )
        `;
        this.db.run(createTableSQL, (err) => {
            if (err) {
                console.error('Error al crear la tabla:', err.message);
            } else {
                console.log('Tabla "orders" verificada o creada correctamente.');
            }
        });
    }

    insertOrder(order) {
        const insertSQL = `INSERT INTO orders (description, amount, date) VALUES (?, ?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(insertSQL, [order.description, order.amount, order.date], function (err) {
                if (err) {
                    console.error('Error al insertar la orden:', err.message);
                    reject(err);
                } else {
                    console.log('Orden guardada con ID:', this.lastID);
                    resolve(this.lastID);
                }
            });
        });
    }

    getAllOrders() {
        const selectSQL = `SELECT * FROM orders`;
        return new Promise((resolve, reject) => {
            this.db.all(selectSQL, [], (err, rows) => {
                if (err) {
                    console.error('Error al obtener las órdenes:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    
}

// Función para guardar la orden en la base de datos
async function saveOrder(orderData) {
    const db = await connectDB();

    // Insertar la orden en la tabla
    await db.run('INSERT INTO orders (orderData) VALUES (?)', JSON.stringify(orderData));

    // Cerrar la conexión a la base de datos
    await db.close();
}
module.exports = Database;
