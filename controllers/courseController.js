const {validationResult} = require("express-validator");
const httpStatusText = require('../utils/httpStatusText')
const Course = require('../models/course.model')
const asyncWrapper = require('../middlewares/asyncWrapper')
const appError = require('../utils/appError')

const getAllCourses = async (req, res) => {
    const query = req.query
    const limit = query.limit || 2;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const total = await Course.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const courses = await Course.find({}, {"__v": false}).limit(limit).skip(skip)

    const buildUrl = (pageNum) => {
        const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        url.searchParams.set('page', pageNum);
        return url.origin + url.pathname + '?' + url.searchParams.toString();
    };


    return res.status(200).json({
        page,
        totalPages,
        limit,
        total,
        next: page < totalPages ? buildUrl(+page + 1) : null,
        prev: page > 1 ? buildUrl(+page - 1) : null,
        data: courses,

    })
}

const getCourse = asyncWrapper(
    async (req, res, next) => {
        const courseId = req.params.courseId;

        const course = await Course.findById(courseId)

        if (!course) {
            const error = appError.create("Course not found", 404, httpStatusText.FAIL);
            return next(error);
        }
        return res.status(200).json({status: httpStatusText.SUCCESS, data: {course: course}})
    }
)

const addCourse = asyncWrapper(
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = appError.create(errors.array(), 400, httpStatusText.FAIL)
            return next(error)
        }
        const newCourse = new Course(req.body)
        await newCourse.save()
        return res.status(200).json({status: httpStatusText.SUCCESS, data: {course: newCourse}})
    }
)

const updateCourse = asyncWrapper(
    async (req, res) => {
        const courseId = req.params.courseId
        await Course.updateOne({"_id": courseId}, {$set: {...req.body}})
        const course = await Course.findById(courseId)
        return res.status(200).json({status: httpStatusText.SUCCESS, data: {course: course}})


    }
)

const deleteCourse = asyncWrapper(
    async (req, res) => {
        const courseId = req.params.courseId
        const deleteResult = await Course.deleteOne({"_id": courseId})
        if (deleteResult.deletedCount == 0) {
            return res.status(200).json({status: httpStatusText.FAIL, data: null})

        } else {
            return res.status(200).json({status: httpStatusText.SUCCESS, data: null})
        }

    }
)


module.exports = {
    getAllCourses, getCourse, addCourse, updateCourse, deleteCourse
}