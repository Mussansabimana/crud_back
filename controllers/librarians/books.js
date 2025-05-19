const { getDb } = require('../../config/db');
const { get } = require('../../routes/librarians/auth');

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

const createBook = async (req, res) => {
    const { title, publisher, supplier, publishedDate } = req.body;

    if (!title || !publisher || !supplier || !publishedDate) {
        return res.status(400).json({ error: 'Title, publisher, and supplier are required' });
    }
    try {
        const db = getDb();

        const [savepublisher] = await db.query('INSERT INTO Publishers (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name', [publisher]);
        const [savesupplier] = await db.query('INSERT INTO Suppliers (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name', [supplier]);
        const publisherId = savepublisher.insertId || savepublisher[0].insertId;
        const supplierId = savesupplier.insertId || savesupplier[0].insertId;

        const [result] = await db.query('INSERT INTO Books (title, publisher_id, supplier_id, published_date) VALUES (?, ?, ?, ?)', [title, publisherId, supplierId, publishedDate]);

        res.status(201).json({ message: 'Book created successfully', bookId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, publisher, supplier, publishedDate } = req.body;

    if (!id || !title || !publisher || !supplier) {
        return res.status(400).json({ error: 'Book ID, title, publisher, and supplier are required' });
    }

    try {
        const db = getDb();

        const [savepublisher] = await db.query('INSERT INTO Publishers (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name', [publisher]);
        const [savesupplier] = await db.query('INSERT INTO Suppliers (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name', [supplier]);
        const publisherId = savepublisher.insertId || savepublisher[0].insertId;
        const supplierId = savesupplier.insertId || savesupplier[0].insertId;

        const [result] = await db.query('UPDATE Books SET title = ?, publisher_id = ?, supplier_id = ?, published_date = ? WHERE id = ?', [title, publisherId, supplierId, publishedDate, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({ message: 'Book updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const acceptBookIsReturned = async (req, res) => {
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
        const [result] = await db.query('UPDATE Books SET status = "available" WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found or already available' });
        }

        // Optionally, you can also update the Borrowed_books table to mark the book as returned
        await db.query('DELETE FROM Borrowed_books WHERE book_id = ?', [id]);

        res.status(200).json({ message: 'Book status updated to available' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getAllBooksBorrowed = async (req, res) => {
    console.log('Fetching all borrowed books');
    try {
        const db = getDb();
        const [borrowedBooks] = await db.query(
            'SELECT b.*, bb.*, m.name AS member_name FROM Borrowed_books bb JOIN Books b ON bb.book_id = b.id JOIN Members m ON bb.member_id = m.id'
        ); 
        
        if (borrowedBooks.length === 0) {
            return res.status(404).json({ error: 'No borrowed books found' });
        }
        res.status(200).json(borrowedBooks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



const deleteBook = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Book ID is required' });
    }

    try {
        const db = getDb();
        const [result] = await db.query('DELETE FROM Books WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({ message: 'Book deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}


module.exports = {
    getAllBooks, 
    getBookById,
    createBook,
    updateBook,
    acceptBookIsReturned,
    getAllBooksBorrowed,   
    deleteBook
}

