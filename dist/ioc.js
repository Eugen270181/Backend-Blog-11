"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioc = exports.authController = exports.securityControllerInstance = exports.usersControllerInstance = exports.commentsControllerInstance = exports.postsControllerInstance = exports.blogsControllerInstance = exports.authServices = exports.securityServices = exports.likesCommentsServices = exports.commentsServices = exports.likesPostsServices = exports.postsServices = exports.blogsServices = exports.usersServices = exports.securityQueryRepository = exports.securityRepository = exports.commentsQueryRepository = exports.commentsRepository = exports.likesCommentsRepository = exports.postsQueryRepository = exports.postsRepository = exports.likesPostsRepository = exports.blogsQueryRepository = exports.blogsRepository = exports.usersQueryRepository = exports.usersRepository = exports.db = void 0;
const blogsServices_1 = require("./features/blogs/services/blogsServices");
const blogsRepository_1 = require("./features/blogs/repositories/blogsRepository");
const blogsQueryRepository_1 = require("./features/blogs/repositories/blogsQueryRepository");
const postsServices_1 = require("./features/posts/services/postsServices");
const postsRepository_1 = require("./features/posts/repositories/postsRepository");
const postsQueryRepository_1 = require("./features/posts/repositories/postsQueryRepository");
const blogs_controller_1 = require("./features/blogs/controllers/blogs.controller");
const commentsServices_1 = require("./features/comments/services/commentsServices");
const commentsQueryRepository_1 = require("./features/comments/repositories/commentsQueryRepository");
const posts_controller_1 = require("./features/posts/controllers/posts.controller");
const commentsRepository_1 = require("./features/comments/repositories/commentsRepository");
const usersRepository_1 = require("./features/users/repositories/usersRepository");
const comments_controller_1 = require("./features/comments/controllers/comments.controller");
const users_controller_1 = require("./features/users/controllers/users.controller");
const usersServices_1 = require("./features/users/services/usersServices");
const usersQueryRepository_1 = require("./features/users/repositories/usersQueryRepository");
const security_controller_1 = require("./features/security/controllers/security.controller");
const securityRepository_1 = require("./features/security/repositories/securityRepository");
const securityQueryRepository_1 = require("./features/security/repositories/securityQueryRepository");
const authServices_1 = require("./features/auth/services/authServices");
const securityServices_1 = require("./features/security/services/securityServices");
const auth_controller_1 = require("./features/auth/controllers/auth.controller");
const likesCommentsServices_1 = require("./features/likes/services/likesCommentsServices");
const likesCommentsRepository_1 = require("./features/likes/repository/likesCommentsRepository");
const DB_1 = require("./common/module/db/DB");
const likesPostsRepository_1 = require("./features/likes/repository/likesPostsRepository");
const likesPostsServices_1 = require("./features/likes/services/likesPostsServices");
const objects = [];
//////////////////DB//////////////////////////////////////////////////////
exports.db = new DB_1.DB();
objects.push(exports.db);
//////////////////DAL - Repositories//////////////////////////////////////
exports.usersRepository = new usersRepository_1.UsersRepository(exports.db);
objects.push(exports.usersRepository);
exports.usersQueryRepository = new usersQueryRepository_1.UsersQueryRepository(exports.db);
objects.push(exports.usersQueryRepository);
exports.blogsRepository = new blogsRepository_1.BlogsRepository(exports.db);
objects.push(exports.blogsRepository);
exports.blogsQueryRepository = new blogsQueryRepository_1.BlogsQueryRepository(exports.db);
objects.push(exports.blogsQueryRepository);
exports.likesPostsRepository = new likesPostsRepository_1.LikesPostsRepository(exports.db);
objects.push(exports.likesPostsRepository);
exports.postsRepository = new postsRepository_1.PostsRepository(exports.db);
objects.push(exports.postsRepository);
exports.postsQueryRepository = new postsQueryRepository_1.PostsQueryRepository(exports.db, exports.likesPostsRepository, exports.usersQueryRepository);
objects.push(exports.postsQueryRepository);
exports.likesCommentsRepository = new likesCommentsRepository_1.LikesCommentsRepository(exports.db);
objects.push(exports.likesCommentsRepository);
exports.commentsRepository = new commentsRepository_1.CommentsRepository(exports.db);
objects.push(exports.commentsRepository);
exports.commentsQueryRepository = new commentsQueryRepository_1.CommentsQueryRepository(exports.db, exports.likesCommentsRepository);
objects.push(exports.commentsQueryRepository);
exports.securityRepository = new securityRepository_1.SecurityRepository(exports.db);
objects.push(exports.securityRepository);
exports.securityQueryRepository = new securityQueryRepository_1.SecurityQueryRepository(exports.db);
objects.push(exports.securityQueryRepository);
//////////////////BLL - Services//////////////////////////////////////////
exports.usersServices = new usersServices_1.UsersServices(exports.usersRepository);
objects.push(exports.usersServices);
exports.blogsServices = new blogsServices_1.BlogsServices(exports.blogsRepository);
objects.push(exports.blogsServices);
exports.postsServices = new postsServices_1.PostsServices(exports.blogsRepository, exports.postsRepository);
objects.push(exports.postsServices);
exports.likesPostsServices = new likesPostsServices_1.LikesPostsServices(exports.likesPostsRepository, exports.usersRepository, exports.postsRepository);
objects.push(exports.likesPostsServices);
exports.commentsServices = new commentsServices_1.CommentsServices(exports.commentsRepository, exports.postsRepository, exports.usersRepository);
objects.push(exports.commentsServices);
exports.likesCommentsServices = new likesCommentsServices_1.LikesCommentsServices(exports.likesCommentsRepository, exports.usersRepository, exports.commentsRepository);
objects.push(exports.likesCommentsServices);
exports.securityServices = new securityServices_1.SecurityServices(exports.securityRepository);
objects.push(exports.securityServices);
exports.authServices = new authServices_1.AuthServices(exports.securityServices, exports.securityRepository, exports.usersServices, exports.usersRepository);
objects.push(exports.authServices);
///////////////////Presentation Layer - Controllers/////////////////////////
exports.blogsControllerInstance = new blogs_controller_1.BlogsController(exports.blogsServices, exports.blogsQueryRepository, exports.postsServices, exports.postsQueryRepository);
objects.push(exports.blogsControllerInstance);
exports.postsControllerInstance = new posts_controller_1.PostsController(exports.postsServices, exports.postsQueryRepository, exports.commentsServices, exports.commentsQueryRepository, exports.likesPostsServices);
objects.push(exports.postsControllerInstance);
exports.commentsControllerInstance = new comments_controller_1.CommentsController(exports.commentsServices, exports.commentsQueryRepository, exports.likesCommentsServices);
objects.push(exports.commentsControllerInstance);
exports.usersControllerInstance = new users_controller_1.UsersController(exports.usersServices, exports.usersQueryRepository);
objects.push(exports.usersControllerInstance);
exports.securityControllerInstance = new security_controller_1.SecurityController(exports.authServices, exports.securityRepository, exports.securityServices, exports.securityQueryRepository);
objects.push(exports.securityControllerInstance);
exports.authController = new auth_controller_1.AuthController(exports.authServices, exports.usersQueryRepository);
objects.push(exports.authController);
//////////////////////////IoC Container - метод получить заранее созданый объект из массива объектов////////////////////////
exports.ioc = {
    getInstance(ClassType) {
        const targetInstance = objects.find((object) => object instanceof ClassType);
        return targetInstance;
    },
};
//# sourceMappingURL=ioc.js.map