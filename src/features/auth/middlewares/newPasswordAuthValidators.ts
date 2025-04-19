import {inputValidationMiddleware} from "../../../common/middleware/inputValidationMiddleware";
import {body} from "express-validator";
import {usersRepository} from "../../../ioc";

const checkPassConfirmCode = async (recoveryCode: string) => {
    const user = await usersRepository.findUserByPassConfirmCode(recoveryCode)
    if (!user) throw new Error("Don't found this confirmation code")//не найден юзер с таким кодом подтверждения
    if (user.passConfirmation!.expirationDate < new Date()) throw new Error("This code already expired")//код подтверждения протух
    return true
}
export const passwordRecoveryValidator = body('newPassword').isString().withMessage('Password must be a string')
    .trim().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 characters long')
export const codePassConfirmValidator = body('recoveryCode').isUUID(4).withMessage('Code is not UUID format').trim()
    .custom(checkPassConfirmCode)
export const newPasswordAuthValidators = [
    passwordRecoveryValidator,
    codePassConfirmValidator,

    inputValidationMiddleware,
]

