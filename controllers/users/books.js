const { getDb } = require('../../config/db');

const getAllBooks = async (req, res) => {
    try {
        const db = getDb();
        const [books] = await db.query('SELECT * FROM Books');
        res.status(200).json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getBookById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Book ID is required' });
    }
    try {
        const db = getDb();
        const [book] = await db.query('SELECT * FROM Books WHERE id = ?', [id]);

        if (book.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json(book[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const bollowBook = async (req, res) => {
    const { bookId, memberId } = req.body;
    if (!bookId || !memberId) {
        return res.status(400).json({ error: 'Book ID and Member ID are required' });
    }
    try {
        const db = getDb();

        // Check if the book is available
        const [book] = await db.query('SELECT * FROM Books WHERE id = ? AND status = "available"', [bookId]);
        if (book.length === 0) {
            return res.status(400).json({ error: 'Book is not available for borrowing' });
        }

        // Create a new borrowed book entry
        const borrowedDate = new Date();
        const dueDate = new Date(borrowedDate);
        dueDate.setDate(dueDate.getDate() + 10); // Set due date to 10 days from now

        const [result] = await db.query('INSERT INTO Borrowed_books (book_id, member_id, borrowed_date, due_date) VALUES (?, ?, ?, ?)', [bookId, memberId, borrowedDate, dueDate]);
        
        // Update the book status to 'borrowed'
        await db.query('UPDATE Books SET status = "borrowed" WHERE id = ?', [bookId]);

        res.status(201).json({ message: 'Book borrowed successfully', borrowedId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getAllBooks,
    getBookById,
    bollowBook
};

