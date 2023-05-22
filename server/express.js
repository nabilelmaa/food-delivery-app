const nodemailer = require('nodemailer');
const client = require('./database');
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

client.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database successfully!");
});

app.listen(PORT, () => {
    console.log(`Server is listening on Port ${PORT}`);
});

app.get('/customer/all', async (req, res) => {
    try {
        const allClients = await client.query('SELECT * FROM customer');
        res.json(allClients.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle login request
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await client.query(`SELECT * FROM customer WHERE email = $1`, [email]);
        if (user.rows.length === 0) {
            console.log(`User ${email} not found`);
            res.status(401).json({ error: 'User not found' });
            return;
        }
        if (user.rows[0].password !== password) {
            console.log(`Incorrect password for user ${email}`);
            res.status(401).json({ error: 'Incorrect password!' });
            return;
        }
        console.log(`Login successful for user ${email}`);
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error!' });
    }
});

app.post("/api/register", async(req, res) => {
    try  {
        const { name, email, password, phone} = req.body;
        const checkCustomer = await client.query(
            "SELECT email FROM customer WHERE email = $1", 
            [email]
        )
        if (checkCustomer.rows.length > 0) {
            console.log(`User ${email} already exists`);
            res.status(401).json({ error: 'User already exists' });
            return;
        }
        const newCustomer = await client.query(
            "INSERT INTO customer (name, email, password, phone) VALUES ($1, $2, $3, $4)", 
            [name, email, password, phone]
        );
        console.log(`Registration successful for user ${email}`);
        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post(('/api/contact'), async(req, res) => {
    try {
        const { name, email, subject, message} = req.body;
        const newMessage = await client.query(
        "INSERT INTO contact (name, email, subject, message) VALUES ($1, $2, $3, $4)",
        [name, email, subject, message]
        );
        res.status(200).json({ message: "Message has been sent successfully!"});
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'YOUR_GMAIL_ACCOUNT',
                pass: 'YOUR_GMAIL_PASSWORD'
            }
        });
    
        const mailOptions = {
            from: `${email}`,
            to: 'nabilelmaa@gmail.com',
            subject: `${subject}`,
            text: `
                Name: ${name}\n
                Email: ${email}\n
                Subject: ${subject}\n
                Message: ${message}\n
            `
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }catch(err) { 
        res.status(500).json({ error: 'Internal server error!' });
    }
})


































































































