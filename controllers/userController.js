const User = require('../models/user.model')
const HttpStatusCode = require('../utils/httpStatusText')
const asyncWrapper = require('../middlewares/asyncWrapper')
const httpStatusText = require("../utils/httpStatusText");
const appError = require('../utils/appError')
const bcrypt = require('bcryptjs')
const generateJWT = require('../utils/generateJWT')


const getAllUsers = asyncWrapper(
    async (req, res) => {
        const query = req.query
        const limit = query.limit || 2;
        const page = query.page || 1;
        const skip = (page - 1) * limit;
        const total = await User.countDocuments();
        const totalPages = Math.ceil(total / limit);

        const users = await User.find({}, {"__v": false}).limit(limit).skip(skip);

        const buildUrl = (pageNum) => {
            const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
            url.searchParams.set('page', pageNum);
            return url.origin + url.pathname + '?' + url.searchParams.toString();
        }

        return res.status(200).json({
            page,
            totalPages,
            limit,
            total,
            next: page < totalPages ? buildUrl(+page + 1) : null,
            prev: page > 1 ? buildUrl(+page - 1) : null,
            data: users,

        })
    }
)

const register = asyncWrapper(
    async (req, res, next) => {

        const {username, email, password} = req.body

        const emailExist = await User.findOne({email: email});
        const usernameExist = await User.findOne({username: username});

        if (emailExist) {
            const error = appError.create('Email Already Exist', 400, httpStatusText.FAIL)
            return next(error)
        } else if (usernameExist) {
            const error = appError.create('Username Already Exist', 400, httpStatusText.FAIL)
            return next(error)
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({...req.body, password: hashedPassword, avatar: req.file.filename})


        const token = await generateJWT({email: newUser.email, id: newUser._id, role: newUser.role});
        newUser.token = token;


        await newUser.save();

        // Remove password from response
        const userResponse = newUser.toObject()
        delete userResponse.password

        return res.status(200).json({status: httpStatusText.SUCCESS, data: {user: userResponse}})
    }
)

const login = asyncWrapper(
    async (req, res, next) => {
        const {email, password} = req.body

        if (!email || !password) {
            const error = appError.create("email and password are required", 400, httpStatusText.FAIL)
            return next(error)
        }

        const user = await User.findOne({email: email})
        if (!user) {
            const error = appError.create("User Not Found", 400, httpStatusText.FAIL)
            return next(error)
        }

        const matchedPassword = await bcrypt.compare(password, user.password)

        if (user && matchedPassword) {

            const token = await generateJWT({email: user.email, id: user._id, role: user.role});

            return res.json({status: httpStatusText.SUCCESS, data: {token}});
        } else {
            const error = appError.create('Wrong Password', 500, httpStatusText.ERROR)
            return next(error);
        }
    }
)

module.exports = {getAllUsers, register, login}