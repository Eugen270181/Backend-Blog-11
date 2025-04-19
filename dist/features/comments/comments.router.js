"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsRouter = void 0;
const express_1 = require("express");
const commentValidators_1 = require("./middlewares/commentValidators");
const accessTokenMiddleware_1 = require("../../common/middleware/accessTokenMiddleware");
const comments_controller_1 = require("./controllers/comments.controller");
const ioc_1 = require("../../ioc");
const likeValidationMiddleware_1 = require("../../common/middleware/likeValidationMiddleware");
exports.commentsRouter = (0, express_1.Router)();
const commentsControllerInstance = ioc_1.ioc.getInstance(comments_controller_1.CommentsController);
exports.commentsRouter.put('/:id/like-status', accessTokenMiddleware_1.accessTokenMiddleware, ...likeValidationMiddleware_1.likeValidationMiddleware, commentsControllerInstance.updateCommentLikeController.bind(commentsControllerInstance));
exports.commentsRouter.get('/:id', accessTokenMiddleware_1.accessTokenMiddleware, commentsControllerInstance.findCommentController.bind(commentsControllerInstance));
exports.commentsRouter.put('/:id', accessTokenMiddleware_1.accessTokenMiddleware, ...commentValidators_1.commentValidators, commentsControllerInstance.updateCommentController.bind(commentsControllerInstance));
exports.commentsRouter.delete('/:id', accessTokenMiddleware_1.accessTokenMiddleware, commentsControllerInstance.delCommentController.bind(commentsControllerInstance));
//# sourceMappingURL=comments.router.js.map