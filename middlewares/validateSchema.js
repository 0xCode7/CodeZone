const {body} = require("express-validator");


const validateSchema = () => {
    return [
        body("title")
            .notEmpty().withMessage("Title is required")
            .isLength({min: 2}).withMessage("Title must be more than 2 chars"),
        body("price")
            .notEmpty().withMessage("Price is required")
            .isNumeric().withMessage("Price must be a number")
    ]
}
module.exports = {validateSchema}