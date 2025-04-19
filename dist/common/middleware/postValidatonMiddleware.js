"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogPostValidators = exports.postValidators = exports.blogIdValidator = exports.contentValidator = exports.shortDescriptionValidator = exports.titleValidator = void 0;
const express_validator_1 = require("express-validator");
const inputValidationMiddleware_1 = require("./inputValidationMiddleware");
const ioc_1 = require("../../ioc");
exports.titleValidator = (0, express_validator_1.body)('title').isString().withMessage('not string')
    .trim().isLength({ min: 1, max: 30 }).withMessage('more then 30 or 0');
exports.shortDescriptionValidator = (0, express_validator_1.body)('shortDescription').isString().withMessage('not string')
    .trim().isLength({ min: 1, max: 100 }).withMessage('more then 100 or 0');
exports.contentValidator = (0, express_validator_1.body)('content').isString().withMessage('not string')
    .trim().isLength({ min: 1, max: 1000 }).withMessage('more then 1000 or 0');
///////////////////////////////////////////////////////////////////////////////////////////////////////
exports.blogIdValidator = (0, express_validator_1.body)('blogId').isString().withMessage('not string')
    .trim().custom(async (blogId) => {
    const blog = await ioc_1.blogsRepository.findBlogById(blogId);
    if (!blog) {
        throw new Error('Incorrect blogId!');
    }
    // console.log(blog)
    return true;
}).withMessage('no blog');
exports.postValidators = [
    exports.titleValidator,
    exports.shortDescriptionValidator,
    exports.contentValidator,
    exports.blogIdValidator,
    inputValidationMiddleware_1.inputValidationMiddleware,
];
exports.blogPostValidators = [
    exports.titleValidator,
    exports.shortDescriptionValidator,
    exports.contentValidator,
    inputValidationMiddleware_1.inputValidationMiddleware,
];
//# sourceMappingURL=postValidatonMiddleware.js.map