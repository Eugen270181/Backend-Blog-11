"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regEmailResendingAuthValidators = exports.emailRegResendingValidator = void 0;
const inputValidationMiddleware_1 = require("../../../common/middleware/inputValidationMiddleware");
const express_validator_1 = require("express-validator");
const ioc_1 = require("../../../ioc");
const EmailConfirmationValidator = async (email) => {
    const user = await ioc_1.usersRepository.findUserByEmail(email);
    if (!user)
        throw new Error("Users account with this Email not found!");
    if (user.isConfirmed)
        throw new Error("Users account with this email already activated!");
    return true;
};
exports.emailRegResendingValidator = (0, express_validator_1.body)('email').isString().withMessage('Email must be a string')
    .trim().isEmail().withMessage('Email must be a valid email address').custom(EmailConfirmationValidator);
exports.regEmailResendingAuthValidators = [
    exports.emailRegResendingValidator,
    inputValidationMiddleware_1.inputValidationMiddleware,
];
//# sourceMappingURL=regEmailResendingValidators.js.map