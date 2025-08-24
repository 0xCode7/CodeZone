const express = require('express')
const verifyToken = require('../middlewares/verifyToken')
const multer = require('multer')
const router = express.Router();
const usersController = require('../controllers/userController')
const appError = require('../utils/appError')

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("FILE", file)
        cb(null, 'uploads')
    },

    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const user = req.body.username || 'user'
        const fileName = `${user}-${Date.now()}.${ext}`
        cb(null, fileName)
    }
})

const fileFilter = (req, file, cb) => {
    const imageType = file.mimetype.split('/')[0]

    if (imageType === 'image') {
        return cb(null, true)
    } else {
        return cb(appError.create('File must be an image', 400), true)

    }
}

const upload = multer({storage: diskStorage, fileFilter})

// Get all Users
router.route('')
    .get(verifyToken, usersController.getAllUsers)

// Register
router.route('/register')
    .post(upload.single('avatar'), usersController.register)

// Login
router.route('/login')
    .post(usersController.login)

module.exports = router;