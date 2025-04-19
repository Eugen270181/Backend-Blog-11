"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsRouter = void 0;
const express_1 = require("express");
const blogValidators_1 = require("./middlewares/blogValidators");
const adminMiddleware_1 = require("../../common/middleware/adminMiddleware");
const querySortSanitizerMiddleware_1 = require("../../common/middleware/querySortSanitizerMiddleware");
const postValidatonMiddleware_1 = require("../../common/middleware/postValidatonMiddleware");
const ioc_1 = require("../../ioc");
const blogs_controller_1 = require("./controllers/blogs.controller");
exports.blogsRouter = (0, express_1.Router)();
const blogsControllerInstance = ioc_1.ioc.getInstance(blogs_controller_1.BlogsController);
exports.blogsRouter.get('/', ...querySortSanitizerMiddleware_1.querySortSanitizers, blogsControllerInstance.getBlogsController.bind(blogsControllerInstance));
exports.blogsRouter.get('/:id', blogsControllerInstance.findBlogController.bind(blogsControllerInstance));
exports.blogsRouter.get('/:id/posts', ...querySortSanitizerMiddleware_1.querySortSanitizers, blogsControllerInstance.findBlogPostsController.bind(blogsControllerInstance)); //new - task-04
exports.blogsRouter.post('/:id/posts', adminMiddleware_1.adminMiddleware, ...postValidatonMiddleware_1.blogPostValidators, blogsControllerInstance.createBlogPostController.bind(blogsControllerInstance)); //new - task-04
exports.blogsRouter.post('/', adminMiddleware_1.adminMiddleware, ...blogValidators_1.blogValidators, blogsControllerInstance.createBlogController.bind(blogsControllerInstance));
exports.blogsRouter.delete('/:id', adminMiddleware_1.adminMiddleware, blogsControllerInstance.delBlogController.bind(blogsControllerInstance));
exports.blogsRouter.put('/:id', adminMiddleware_1.adminMiddleware, ...blogValidators_1.blogValidators, blogsControllerInstance.updateBlogController.bind(blogsControllerInstance));
// не забудьте добавить роут в апп
//# sourceMappingURL=blogs.router.js.map