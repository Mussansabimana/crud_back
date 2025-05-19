const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

let db;

const initializeDbConnection = async () => {
    try {
        const tempDb = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    })
    await tempDb.connect();
    await tempDb.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);

    await tempDb.end();

    db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    })

    await db.connect();

        await db.beginTransaction();
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS Librarians (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
            `)
        
        console.log('Librarians table created successfully');

    await db.query(`
CREATE TABLE IF NOT EXISTS Suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
    `);

    console.log('Suppliers table created successfully');    

    await db.query(`
        CREATE TABLE IF NOT EXISTS Publishers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
        `)
    
    console.log('Publishers table created successfully');  

    await db.query(`
        CREATE TABLE IF NOT EXISTS Members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(100) NOT NULL,
    status ENUM('teacher', 'student') DEFAULT 'student',
    class VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
        `)
    
    console.log('Members table created successfully');

    await db.query(`
CREATE TABLE IF NOT EXISTS Books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    publisher_id INT NOT NULL,
    supplier_id INT NOT NULL,
    published_date DATE NOT NULL,
    status ENUM('available', 'borrowed') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES Publishers(id),
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id)

)
        `)
    console.log('Books table created successfully');

    await db.query(`
        CREATE TABLE IF NOT EXISTS Borrowed_books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    borrowed_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE DEFAULT NULL,
    status ENUM('borrowed', 'returned') DEFAULT 'borrowed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES Books(id),
    FOREIGN KEY (member_id) REFERENCES Members(id)
)
        `)
    
    console.log('Borrowed_books table created successfully');
    
        console.log('Database connected successfully');

        return true;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }

};

const getDb = () => {
    if (!db) {
        throw new Error('Database connection not initialized. Call initializeDbConnection first.');
    }
    return db;
};

module.exports = {
    getDb,
    initializeDbConnection
};
