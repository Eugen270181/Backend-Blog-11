"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const express_1 = require("express");
const adminMiddleware_1 = require("../../common/middleware/adminMiddleware");
const accessTokenMiddleware_1 = require("../../common/middleware/accessTokenMiddleware");
const commentValidators_1 = require("../comments/middlewares/commentValidators");
const querySortSanitizerMiddleware_1 = require("../../common/middleware/querySortSanitizerMiddleware");
const postValidatonMiddleware_1 = require("../../common/middleware/postValidatonMiddleware");
const posts_controller_1 = require("./controllers/posts.controller");
const ioc_1 = require("../../ioc");
const likeValidationMiddleware_1 = require("../../common/middleware/likeValidationMiddleware");
exports.postsRouter = (0, express_1.Router)();
const postsControllerInstance = ioc_1.ioc.getInstance(posts_controller_1.PostsController);
exports.postsRouter.get('/', ...querySortSanitizerMiddleware_1.querySortSanitizers, postsControllerInstance.getPostsController.bind(postsControllerInstance));
exports.postsRouter.get('/:id', postsControllerInstance.findPostController.bind(postsControllerInstance));
exports.postsRouter.get('/:id/comments', accessTokenMiddleware_1.accessTokenMiddleware, ...querySortSanitizerMiddleware_1.querySortSanitizers, postsControllerInstance.getPostCommentsController.bind(postsControllerInstance));
exports.postsRouter.post('/:id/comments', accessTokenMiddleware_1.accessTokenMiddleware, ...commentValidators_1.commentValidators, postsControllerInstance.createPostCommentController.bind(postsControllerInstance));
exports.postsRouter.post('/', adminMiddleware_1.adminMiddleware, ...postValidatonMiddleware_1.postValidators, postsControllerInstance.createPostController.bind(postsControllerInstance));
exports.postsRouter.delete('/:id', adminMiddleware_1.adminMiddleware, postsControllerInstance.delPostController.bind(postsControllerInstance));
exports.postsRouter.put('/:id', adminMiddleware_1.adminMiddleware, ...postValidatonMiddleware_1.postValidators, postsControllerInstance.updatePostController.bind(postsControllerInstance));
exports.postsRouter.put('/:id/like-status', accessTokenMiddleware_1.accessTokenMiddleware, ...likeValidationMiddleware_1.likeValidationMiddleware, postsControllerInstance.updatePostLikeController.bind(postsControllerInstance));
// не забудьте добавить роут в апп
//# sourceMappingURL=posts.router.js.map