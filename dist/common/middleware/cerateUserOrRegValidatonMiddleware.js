"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserValidators = exports.regAuthValidators = void 0;
const express_validator_1 = require("express-validator");
const inputValidationMiddleware_1 = require("./inputValidationMiddleware");
const ioc_1 = require("../../ioc");
const uniqueLoginValidator = async (login) => {
    const user = await ioc_1.usersRepository.findUserByLogin(login);
    if (user)
        throw new Error("login already exist");
    return true;
};
const uniqueEmailValidator = async (email) => {
    const user = await ioc_1.usersRepository.findUserByEmail(email);
    if (user)
        throw new Error("email already exist");
    return true;
};
const loginValidator = (0, express_validator_1.body)('login').isString().withMessage('Login must be a string')
    .trim().isLength({ min: 3, max: 10 }).withMessage('Login must be between 3 and 10 characters long')
    .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login must contain only letters, numbers, underscores, and hyphens')
    .custom(uniqueLoginValidator);
const emailRegValidator = (0, express_validator_1.body)('email').isString().withMessage('Email must be a string')
    .trim().isEmail().withMessage('Email must be a valid email address').custom(uniqueEmailValidator);
const passwordValidator = (0, express_validator_1.body)('password').isString().withMessage('Password must be a string')
    .trim().isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters long');
exports.regAuthValidators = [
    loginValidator,
    emailRegValidator,
    passwordValidator,
    inputValidationMiddleware_1.inputValidationMiddleware,
];
exports.createUserValidators = exports.regAuthValidators;
//# sourceMappingURL=cerateUserOrRegValidatonMiddleware.js.map