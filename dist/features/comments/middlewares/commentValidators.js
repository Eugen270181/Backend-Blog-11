"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentValidators = exports.contentValidator = void 0;
const express_validator_1 = require("express-validator");
const inputValidationMiddleware_1 = require("../../../common/middleware/inputValidationMiddleware");
//content: string //min 20 max 300
exports.contentValidator = (0, express_validator_1.body)('content').isString().withMessage('Login must be a string')
    .trim().isLength({ min: 20, max: 300 }).withMessage('Login must be between 20 and 300 characters long');
exports.commentValidators = [
    exports.contentValidator,
    inputValidationMiddleware_1.inputValidationMiddleware
];
//# sourceMappingURL=commentValidators.js.map