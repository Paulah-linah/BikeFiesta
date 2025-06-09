const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { jsPDF } = require('jspdf');
const app = express();
const port = 3000;

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bikefiesta',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

// Contact form submission
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    const query = 'INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)';
    const values = [name, email, message];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error submitting contact form:', err);
            res.status(500).send('Error submitting contact form');
            return;
        }

        console.log('Contact form submitted successfully. Result:', result);
        res.status(200).send('Contact form submitted successfully');
    });
});

// Order submission with stock management
app.post('/order', (req, res) => {
    const { orderItems, customerName, customerEmail, customerPhone, totalPrice } = req.body;

    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).send('Error submitting order');
        }

        // 1. Check stock availability and lock rows
        const checkStockPromises = orderItems.map((item) => {
            return new Promise((resolve, reject) => {
                const stockQuery = 'SELECT stock FROM products WHERE name = ? FOR UPDATE';
                db.query(stockQuery, [item.name], (err, results) => {
                    if (err) return reject(err);
                    if (results.length === 0) return reject(new Error(`Product ${item.name} not found`));
                    if (results[0].stock < item.quantity) reject(new Error(`Insufficient stock for ${item.name}`));
                    else resolve();
                });
            });
        });

        Promise.all(checkStockPromises)
            .then(() => {
                // 2. Create order
                const orderQuery = 'INSERT INTO orders (total_price, name, email, phone) VALUES (?, ?, ?, ?)';
                db.query(orderQuery, [totalPrice, customerName, customerEmail, customerPhone], 
                    (err, result) => {
                        if (err) {
                            console.error('Error submitting order:', err);
                            return db.rollback(() => res.status(500).send('Error submitting order'));
                        }

                        const orderId = result.insertId;

                        // 3. Insert order items
                        const itemQueries = orderItems.map((item) => {
                            return new Promise((resolve, reject) => {
                                const itemQuery = 'INSERT INTO order_items (order_id, category, item_name, price, quantity) VALUES (?, ?, ?, ?, ?)';
                                db.query(itemQuery, [orderId, item.category, item.name, item.price, item.quantity], 
                                    (err) => err ? reject(err) : resolve()
                                );
                            });
                        });

                        Promise.all(itemQueries)
                            .then(() => {
                                // 4. Update stock
                                const updateStockPromises = orderItems.map((item) => {
                                    return new Promise((resolve, reject) => {
                                        const updateQuery = 'UPDATE products SET stock = stock - ? WHERE name = ?';
                                        db.query(updateQuery, [item.quantity, item.name], 
                                            (err) => err ? reject(err) : resolve()
                                        );
                                    });
                                });

                                Promise.all(updateStockPromises)
                                    .then(() => {
                                        // 5. Record sale
                                        const salesQuery = 'INSERT INTO sales (order_id, total_price) VALUES (?, ?)';
                                        db.query(salesQuery, [orderId, totalPrice], 
                                            (err) => {
                                                if (err) {
                                                    console.error('Error inserting into sales:', err);
                                                    return db.rollback(() => res.status(500).send('Error submitting order'));
                                                }

                                                // Commit transaction
                                                db.commit((err) => {
                                                    if (err) {
                                                        console.error('Error committing transaction:', err);
                                                        return db.rollback(() => res.status(500).send('Error submitting order'));
                                                    }
                                                    res.status(200).send('Order submitted successfully');
                                                });
                                            }
                                        );
                                    })
                                    .catch((err) => {
                                        console.error('Error updating stock:', err);
                                        db.rollback(() => res.status(500).send('Error submitting order'));
                                    });
                            })
                            .catch((err) => {
                                console.error('Error inserting order items:', err);
                                db.rollback(() => res.status(500).send('Error submitting order'));
                            });
                    }
                );
            })
            .catch((err) => {
                console.error('Error in order processing:', err);
                db.rollback(() => res.status(500).send('Error submitting order'));
            });
    });
});

// Admin login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM admins WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length > 0) {
            req.session.isAuthenticated = true;
            req.session.adminId = results[0].id;
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Serve admin dashboard
app.get('/admin-dashboard', (req, res) => {
    if (req.session.isAuthenticated) {
        res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
    } else {
        res.redirect('/login.html');
    }
});

// Product Management Endpoints
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Error fetching products');
            return;
        }
        res.json(results);
    });
});

app.get('/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            res.status(500).send('Error fetching product');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Product not found');
            return;
        }
        res.json(results[0]);
    });
});

app.post('/products', (req, res) => {
    const { name, category, price, stock } = req.body;
    const query = 'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)';
    db.query(query, [name, category, price, stock], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            res.status(500).send('Error adding product');
            return;
        }
        res.json({ id: result.insertId, ...req.body });
    });
});

app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const { name, category, price, stock } = req.body;
    const query = 'UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?';
    db.query(query, [name, category, price, stock, productId], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            res.status(500).send('Error updating product');
            return;
        }
        res.json({ id: productId, ...req.body });
    });
});

app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            res.status(500).send('Error deleting product');
            return;
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

// Orders endpoints
app.get('/orders', (req, res) => {
    const orderQuery = `
        SELECT o.id, o.total_price, o.name, o.email, o.phone, o.created_at, o.status,
               oi.category, oi.item_name, oi.price, oi.quantity 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
    `;
    db.query(orderQuery, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).send('Error fetching orders');
        }

        const orders = {};
        results.forEach(row => {
            if (!orders[row.id]) {
                orders[row.id] = {
                    id: row.id,
                    total_price: `Kshs.${row.total_price}`,
                    name: row.name,
                    email: row.email,
                    phone: row.phone,
                    created_at: row.created_at,
                    status: row.status,
                    items: []
                };
            }
            orders[row.id].items.push({
                category: row.category,
                item_name: row.item_name,
                price: `Kshs.${row.price}`,
                quantity: row.quantity
            });
        });

        res.json(Object.values(orders));
    });
});

app.put('/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    db.query(query, [status, id], (err) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).send('Error updating order status');
        }
        res.send('Order status updated successfully');
    });
});

// Sales endpoints
app.get('/sales', (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
    }

    console.log('Fetching sales data with dates:', { startDate, endDate });

    const query = `
        SELECT 
            id,
            total_price,
            created_at
        FROM orders
        WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
        ORDER BY created_at ASC
    `;

    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching sales data:', err);
            res.status(500).json({ error: 'Error fetching sales data' });
            return;
        }

        console.log('Found sales records:', results.length);
        
        res.json(results);
    });
});

app.get('/sales/report', (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
    }

    const query = `
        SELECT 
            orders.id,
            orders.total_price,
            orders.created_at,
            orders.name as customer_name,
            orders.email as customer_email,
            orders.phone as customer_phone,
            order_items.item_name,
            order_items.category,
            order_items.price as item_price,
            order_items.quantity
        FROM orders
        LEFT JOIN order_items ON orders.id = order_items.order_id
        WHERE orders.created_at BETWEEN ? AND ?
        ORDER BY orders.created_at ASC
    `;

    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error generating sales report:', err);
            res.status(500).json({ error: 'Error generating sales report' });
            return;
        }
        res.json(results);
    });
});

app.get('/generate-sales-report', (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
    }

    const query = `
        SELECT 
            orders.id,
            orders.total_price,
            orders.created_at,
            orders.name as customer_name,
            order_items.item_name,
            order_items.quantity,
            order_items.price as item_price
        FROM orders
        LEFT JOIN order_items ON orders.id = order_items.order_id
        WHERE orders.created_at BETWEEN ? AND ?
        ORDER BY orders.created_at ASC
    `;

    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error generating PDF report:', err);
            res.status(500).json({ error: 'Error generating PDF report' });
            return;
        }

        const doc = new jsPDF();

        // Add report title and date range
        doc.setFontSize(16);
        doc.text('Sales Report', 10, 10);
        doc.setFontSize(12);
        doc.text(`Period: ${startDate} to ${endDate}`, 10, 20);

        // Calculate total sales
        const totalSales = results.reduce((sum, row) => sum + row.total_price, 0);
        doc.text(`Total Sales: PHP ${totalSales.toFixed(2)}`, 10, 30);

        // Add sales details
        doc.setFontSize(10);
        let yPos = 40;
        results.forEach((row) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(`Order ID: ${row.id}`, 10, yPos);
            doc.text(`Date: ${new Date(row.created_at).toLocaleDateString()}`, 10, yPos + 5);
            doc.text(`Customer: ${row.customer_name}`, 10, yPos + 10);
            doc.text(`Item: ${row.item_name} x${row.quantity}`, 10, yPos + 15);
            doc.text(`Amount: PHP ${row.total_price.toFixed(2)}`, 10, yPos + 20);
            yPos += 30;
        });

        const pdf = doc.output('arraybuffer');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=sales_report_${startDate}_to_${endDate}.pdf`);
        res.send(Buffer.from(pdf));
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});