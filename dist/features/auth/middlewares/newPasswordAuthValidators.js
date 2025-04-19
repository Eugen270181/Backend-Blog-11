"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPasswordAuthValidators = exports.codePassConfirmValidator = exports.passwordRecoveryValidator = void 0;
const inputValidationMiddleware_1 = require("../../../common/middleware/inputValidationMiddleware");
const express_validator_1 = require("express-validator");
const ioc_1 = require("../../../ioc");
const checkPassConfirmCode = async (recoveryCode) => {
    const user = await ioc_1.usersRepository.findUserByPassConfirmCode(recoveryCode);
    if (!user)
        throw new Error("Don't found this confirmation code"); //не найден юзер с таким кодом подтверждения
    if (user.passConfirmation.expirationDate < new Date())
        throw new Error("This code already expired"); //код подтверждения протух
    return true;
};
exports.passwordRecoveryValidator = (0, express_validator_1.body)('newPassword').isString().withMessage('Password must be a string')
    .trim().isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters long');
exports.codePassConfirmValidator = (0, express_validator_1.body)('recoveryCode').isUUID(4).withMessage('Code is not UUID format').trim()
    .custom(checkPassConfirmCode);
exports.newPasswordAuthValidators = [
    exports.passwordRecoveryValidator,
    exports.codePassConfirmValidator,
    inputValidationMiddleware_1.inputValidationMiddleware,
];
//# sourceMappingURL=newPasswordAuthValidators.js.map