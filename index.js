const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
const Book = require('./models/book.js');
const multer = require('multer');
const upload = multer({dest : `${__dirname}/uploads/`});
const fs = require('fs')
const mongodb = require('mongodb');
app.use(express.static('public'))


// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://127.0.0.1:27017/bookLibrary', { useNewUrlParser: true, useUnifiedTopology: true });



// Home route - Display all books
app.get('/', async (req, res) => {
    try {
        console.log("fdfddfdfdfdsd");
        const books = await Book.find();

        books.forEach(book => {
            if (book.image && book.image.data) {
                book.imageBase64 = book.image.data.toString('base64');
            }
        });
        res.render('index', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Add new book route
app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add',upload.single('image'), async (req, res) => {
    try {
        const { title, author, read, rating } = req.body;

        // const imageFile = req.files ? req.files.image : null;
        // let imageFileName = 'default.jpg'; // Default image filename
        const imgData = fs.readFileSync(req.file.path);

        const image = {
            contentType: 'image/jpeg',
            data: new mongodb.Binary(imgData),
        };

        // Handle image upload
        // if (imageFile) {
        //     // Save the file to your server or cloud storage
        //     // You need to implement this part based on your storage solution
        //     // For now, let's assume the image is saved in the 'public/uploads' directory
        //     const uploadPath = 'public/uploads/';
        //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        //     imageFileName = `${uniqueSuffix}-${imageFile.name}`;
        //     await imageFile.mv(uploadPath + imageFileName);
        // }

        const newBook = new Book({ 
            title, 
            author, 
            read, 
            rating, 
            image: {
                data: imgData,
                contentType: 'image/jpeg'
            }
        });
        await newBook.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal gfgfgfg Server Error');
    }
});

// Edit book route
app.get('/edit/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        res.render('edit', { book });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal3 Server Error');
    }
});

app.post('/edit/:id', async (req, res) => {
    try {
        const { title, author, read, rating } = req.body;
        await Book.findByIdAndUpdate(req.params.id, { title, author, read, rating });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal4 Server Error');
    }
});

// Delete book route
app.get('/delete/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal5 Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});