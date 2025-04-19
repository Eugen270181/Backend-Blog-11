"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regConfirmAuthValidators = void 0;
const inputValidationMiddleware_1 = require("../../../common/middleware/inputValidationMiddleware");
const express_validator_1 = require("express-validator");
const ioc_1 = require("../../../ioc");
const checkRegConfirmCode = async (code) => {
    const user = await ioc_1.usersRepository.findUserByRegConfirmCode(code);
    if (!user)
        throw new Error("Don't found this confirmation code"); //не найден пользователь с этим кодом подтверждения регистрации
    if (user.isConfirmed)
        throw new Error("This User already confirmed"); //пользователь уже подтвержден
    if (user.emailConfirmation.expirationDate < new Date())
        throw new Error("This code already expired"); //код подтверждения уже протух
    return true;
};
const codeRegConfirmValidator = (0, express_validator_1.body)('code').isUUID(4).withMessage('Code is not UUID format').trim()
    .custom(checkRegConfirmCode);
exports.regConfirmAuthValidators = [
    codeRegConfirmValidator,
    inputValidationMiddleware_1.inputValidationMiddleware,
];
//# sourceMappingURL=regConfirmAuthValidators.js.map