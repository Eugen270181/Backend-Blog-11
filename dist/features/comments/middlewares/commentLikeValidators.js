"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentLikeValidators = exports.likeStatusValidator = void 0;
const express_validator_1 = require("express-validator");
const inputValidationMiddleware_1 = require("../../../common/middleware/inputValidationMiddleware");
const likeStatus_1 = require("../../../common/types/enum/likeStatus");
//content: string //min 20 max 300
//TODO with validation
exports.likeStatusValidator = (0, express_validator_1.body)('likeStatus').isIn(Object.values(likeStatus_1.LikeStatus))
    .withMessage(`likeStatus must be one of the following values: ${Object.values(likeStatus_1.LikeStatus).join(', ')}`);
exports.commentLikeValidators = [
    exports.likeStatusValidator,
    inputValidationMiddleware_1.inputValidationMiddleware
];
//# sourceMappingURL=likeValidationMiddleware.js.map