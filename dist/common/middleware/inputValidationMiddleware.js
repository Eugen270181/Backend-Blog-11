"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputValidationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const inputValidationMiddleware = (req, res, next) => {
    const errorFormatter = (error) => {
        return { message: error.msg, field: (error.type === 'field' ? error.path : 'unknown') };
    };
    const result = (0, express_validator_1.validationResult)(req).formatWith(errorFormatter);
    if (!result.isEmpty())
        return res
            .status(400)
            .send({ errorsMessages: result.array({ onlyFirstError: true }) });
    return next();
};
exports.inputValidationMiddleware = inputValidationMiddleware;
//# sourceMappingURL=inputValidationMiddleware.js.map