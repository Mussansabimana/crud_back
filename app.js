const express = require('express');
const cors = require('cors');
const expressSession = require('express-session');
const morgan = require('morgan');
const dotenv = require('dotenv');

const { initializeDbConnection } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4444;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        sameSite: 'strict', // CSRF protection
        secure: false
    }
}));

// 404 handler
// app.use((req, res, next) => {
//     res.status(404).json({ error: 'Not Found' });
// });

const initServer = async () => {
    try {
        await initializeDbConnection();

        // Routes

        // librarian routes
        app.use('/api/auth/librarian', require('./routes/librarians/auth'));
        app.use('/api/librarian/books', require('./routes/librarians/books'));
        app.use('/api/librarian/members', require('./routes/librarians/members'));

        // member routes
        app.use('/api/auth/member', require('./routes/users/auth'));
        app.use('/api/member/books', require('./routes/users/books'));

        app.get('/', (req, res) => {
            res.send('Welcome to the Library Management System API');
        });

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

initServer();



