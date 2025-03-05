import {inputValidationMiddleware} from "../../../common/middleware/inputValidationMiddleware";
import {body} from "express-validator";
import {usersRepository} from "../../../ioc";

const checkRegConfirmCode = async (code: string) => {
    const user = await usersRepository.findUserByRegConfirmCode(code)
    if (!user) throw new Error("Don't found this confirmation code")
    if (user.emailConfirmation.isConfirmed) throw new Error("This User already confirmed")
    if (user.emailConfirmation.expirationDate < new Date()) throw new Error("This code already expired")
    return true
}
const codeRegConfirmValidator = body('code').isUUID(4).withMessage('Code is not UUID format').trim()
    .custom(checkRegConfirmCode)
export const regConfirmAuthValidators = [
    codeRegConfirmValidator,

    inputValidationMiddleware,
]

