import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Estas líneas son necesarias para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            // Validar que los campos no sean nulos o indefinidos
            if (!order.description || order.amount == null || !order.date) {
                const errorMsg = `Falta información para insertar la orden: 
                description=${order.description}, amount=${order.amount}, date=${order.date}`;
                console.error(errorMsg);
                return reject(new Error(errorMsg));
            }

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

    async saveOrder(orderData) {
        return this.insertOrder(orderData);
    }
}

export default Database;
