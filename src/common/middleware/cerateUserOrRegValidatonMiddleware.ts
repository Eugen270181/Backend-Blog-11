import {body} from "express-validator";
import {inputValidationMiddleware} from "./inputValidationMiddleware";
import {usersRepository} from "../../ioc";


const uniqueLoginValidator = async (login: string) => {
    const user = await usersRepository.findUserByLogin(login);
    if (user) throw new Error("login already exist")
    return true
}
const uniqueEmailValidator = async (email: string) => {
    const user = await usersRepository.findUserByEmail(email);
    if (user) throw new Error("email already exist")
    return true
}
const loginValidator = body('login').isString().withMessage('Login must be a string')
    .trim().isLength({ min: 3, max: 10 }).withMessage('Login must be between 3 and 10 characters long')
    .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login must contain only letters, numbers, underscores, and hyphens')
    .custom(uniqueLoginValidator)
const emailRegValidator = body('email').isString().withMessage('Email must be a string')
    .trim().isEmail().withMessage('Email must be a valid email address').custom(uniqueEmailValidator)
const passwordValidator = body('password').isString().withMessage('Password must be a string')
    .trim().isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters long')

export const regAuthValidators = [
    passwordValidator,
    loginValidator,
    emailRegValidator,

    inputValidationMiddleware,
]

export const createUserValidators = regAuthValidators

