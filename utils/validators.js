const {body} = require("express-validator");
const User = require("../models/user");

exports.registerValidators = [
    body("email")
        .isEmail()
        .withMessage("Write correct email")
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value});
                if (user) {
                    return Promise.reject("Email already exists.");
                }
            } catch (e) {
                console.log(e);
            }
        })
        .normalizeEmail(),
    body("password")
        .isLength({min: 6, max: 20})
        .withMessage("Password length must be between 6-20")
        .trim(),
    body("confirm")
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error("Password does not match.");
            }
            return true;
        })
        .trim(),
    body("name")
        .isLength({min: 2})
        .withMessage("Write correct email"),
];

exports.courseValidators = [
    body("title")
        .isLength({min: 3})
        .withMessage("Min length 3.")
        .trim(),
    body("price")
        .isNumeric()
        .withMessage("Price must be a number."),
    body("img")
        .isURL()
        .withMessage("Write a valid URL address.")
];