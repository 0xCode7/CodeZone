const coursesController = require('../controllers/courseController')
const express = require("express");
const {validateSchema} = require("../middlewares/validateSchema");
const verifyToken = require('../middlewares/verifyToken')
const allowedTo = require('../middlewares/allowedTo')
const userRole = require('../utils/userRole')
const router = express.Router()

router.route('')
    .get(coursesController.getAllCourses)
    .post(validateSchema(), coursesController.addCourse)


router.route('/:courseId')
    .get(coursesController.getCourse)
    .patch(verifyToken, allowedTo(userRole.MANAGER, userRole.ADMIN), coursesController.updateCourse)
    .delete(verifyToken, allowedTo(userRole.MANAGER, userRole.ADMIN), coursesController.deleteCourse);


module.exports = router;