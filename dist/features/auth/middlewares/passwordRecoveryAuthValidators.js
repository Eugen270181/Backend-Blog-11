"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordRecoveryAuthValidators = void 0;
const inputValidationMiddleware_1 = require("../../../common/middleware/inputValidationMiddleware");
const express_validator_1 = require("express-validator");
const emailPassRecoveryValidator = (0, express_validator_1.body)('email').isString().withMessage('Email must be a string')
    .trim().isEmail().withMessage('Email must be a valid email address');
exports.passwordRecoveryAuthValidators = [
    emailPassRecoveryValidator,
    inputValidationMiddleware_1.inputValidationMiddleware,
];
//# sourceMappingURL=passwordRecoveryAuthValidators.js.map