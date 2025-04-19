"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAuthValidators = void 0;
const inputValidationMiddleware_1 = require("../../../common/middleware/inputValidationMiddleware");
const express_validator_1 = require("express-validator");
const loginOrEmailValidator = (0, express_validator_1.body)('loginOrEmail').isString().withMessage('not string');
exports.loginAuthValidators = [
    loginOrEmailValidator,
    inputValidationMiddleware_1.inputValidationMiddleware,
];
//# sourceMappingURL=loginAuthValidators.js.map