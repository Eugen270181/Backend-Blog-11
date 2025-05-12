import {UsersRepository} from "../users/repositories/usersRepository";
import {body} from "express-validator";

export class AuthValidation {

    constructor(private usersRepository: UsersRepository) {}

    uniqueLoginValidator = async (login: string) => {
        const user = await this.usersRepository.findUserByLogin(login);
        if (user) throw new Error("login already exist")
        return true
    }

    uniqueEmailValidator = async (email: string) => {
        const user = await this.usersRepository.findUserByEmail(email);
        if (user) throw new Error("email already exist")
        return true
    }

    loginValidator = body('login').isString().withMessage('Login must be a string')
        .trim().isLength({min: 3, max: 10}).withMessage('Login must be between 3 and 10 characters long')
        .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login must contain only letters, numbers, underscores, and hyphens')
        .custom(this.uniqueLoginValidator)

    emailRegValidator = body('email').isString().withMessage('Email must be a string')
        .trim().isEmail().withMessage('Email must be a valid email address').custom(this.uniqueEmailValidator)

    passwordValidator = body('password').isString().withMessage('Password must be a string')
        .trim().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 characters long')

    loginOrEmailValidator = body('loginOrEmail').notEmpty().isString().trim().withMessage('not string')

    checkPassConfirmCode = async (recoveryCode: string) => {
        const user = await this.usersRepository.findUserByPassConfirmCode(recoveryCode)
        if (!user) throw new Error("Don't found this confirmation code")//не найден юзер с таким кодом подтверждения
        if (user.passConfirmation!.expirationDate < new Date()) throw new Error("This code already expired")//код подтверждения протух
        return true
    }

    passwordRecoveryValidator = body('newPassword').isString().withMessage('Password must be a string')
        .trim().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 characters long')

    codePassConfirmValidator = body('recoveryCode').isUUID(4).withMessage('Code is not UUID format').trim()
        .custom(this.checkPassConfirmCode)

    emailPassRecoveryValidator = body('email').isString().withMessage('Email must be a string')
        .trim().isEmail().withMessage('Email must be a valid email address')

    checkRegConfirmCode = async (code: string) => {
        const user = await this.usersRepository.findUserByRegConfirmCode(code)
        if (!user) throw new Error("Don't found this confirmation code")//не найден пользователь с этим кодом подтверждения регистрации
        if (user.isConfirmed) throw new Error("This User already confirmed")//пользователь уже подтвержден
        if (user.emailConfirmation!.expirationDate < new Date()) throw new Error("This code already expired")//код подтверждения уже протух
        return true
    }

    codeRegConfirmValidator = body('code').isUUID(4).withMessage('Code is not UUID format').trim()
        .custom(this.checkRegConfirmCode)

    emailConfirmationValidator = async (email: string) => {
        const user = await this.usersRepository.findUserByEmail(email);

        if (!user) throw new Error("Users account with this Email not found!")
        if (user.isConfirmed) throw new Error("Users account with this email already activated!")

        return true
    }

    emailRegResendingValidator = body('email').isString().withMessage('Email must be a string')
        .trim().isEmail().withMessage('Email must be a valid email address').custom(this.emailConfirmationValidator)

}