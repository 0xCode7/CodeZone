require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path');
const mongoose = require('mongoose')
const coursesRouter = require('./routes/coursesRoute')
const usersRouter = require('./routes/usersRoute')
const httpStatusText = require("./utils/httpStatusText");
const uri = process.env.MONGO_URI;
const app = express();
const notFound = path.join(__dirname, 'views', '404.html');
const uploads = path.join(__dirname, 'uploads')

app.use(cors())
app.use(express.json())
app.use('/api/courses', coursesRouter)
app.use('/api/users', usersRouter)
app.use('/uploads', express.static(uploads))

// 404 handler
app.use((req, res) => {

    res.sendFile(notFound)
});

// Error Handler
app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        status: error.statusText || httpStatusText.ERROR,
        message: error.message,
        code: error.statusCode || 500,
        data: null
    })
})


const PORT = process.env.PORT || 3000;

mongoose.connect(uri).then(() => {
    console.log("Connected to the db");
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
