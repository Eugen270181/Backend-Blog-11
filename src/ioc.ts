import {BlogsServices} from "./features/blogs/services/blogsServices";
import {BlogsRepository} from "./features/blogs/repositories/blogsRepository";
import {BlogsQueryRepository} from "./features/blogs/repositories/blogsQueryRepository";
import {PostsServices} from "./features/posts/services/postsServices";
import {PostsRepository} from "./features/posts/repositories/postsRepository";
import {PostsQueryRepository} from "./features/posts/repositories/postsQueryRepository";
import {BlogsController} from "./features/blogs/controllers/blogs.controller";
import {CommentsServices} from "./features/comments/services/commentsServices";
import {CommentsQueryRepository} from "./features/comments/repositories/commentsQueryRepository";
import {PostsController} from "./features/posts/controllers/posts.controller";
import {CommentsRepository} from "./features/comments/repositories/commentsRepository";
import {UsersRepository} from "./features/users/repositories/usersRepository";
import {CommentsController} from "./features/comments/controllers/comments.controller";
import {UsersController} from "./features/users/controllers/users.controller";
import {UsersServices} from "./features/users/services/usersServices";
import {UsersQueryRepository} from "./features/users/repositories/usersQueryRepository";
import {SecurityController} from "./features/security/controllers/security.controller";
import {SecurityRepository} from "./features/security/repositories/securityRepository";
import {SecurityQueryRepository} from "./features/security/repositories/securityQueryRepository";
import {AuthServices} from "./features/auth/services/authServices";
import {SecurityServices} from "./features/security/services/securityServices";
import {AuthController} from "./features/auth/controllers/auth.controller";
import {LikesServices} from "./features/likes/services/likesServices";
import {LikesRepository} from "./features/likes/repository/likesRepository";
import {DB} from "./common/module/db/DB";

export const db = new DB()
export const blogsRepository = new BlogsRepository(db)
export const blogsQueryRepository = new BlogsQueryRepository(db)
export const postsRepository = new PostsRepository(db)
export const postsQueryRepository = new PostsQueryRepository(db)
export const likesRepository = new LikesRepository(db)
export const commentsRepository = new CommentsRepository(db)
export const commentsQueryRepository = new CommentsQueryRepository(db, likesRepository)
export const usersRepository = new UsersRepository(db)
export const usersQueryRepository = new UsersQueryRepository(db)
export const securityRepository = new SecurityRepository(db)
export const securityQueryRepository = new SecurityQueryRepository(db)

export const blogsServices = new BlogsServices(blogsRepository)
export const postsServices = new PostsServices(blogsRepository, postsRepository)
export const commentsServices = new CommentsServices(commentsRepository, postsRepository, usersRepository)
export const likesServices = new LikesServices(likesRepository, usersRepository, commentsRepository)
export const usersServices = new UsersServices(usersRepository)
export const securityServices = new SecurityServices(securityRepository)
export const authServices = new AuthServices(securityServices, securityRepository, usersServices, usersRepository)
export const blogsController = new BlogsController(
    blogsServices,
    blogsQueryRepository,
    postsServices,
    postsQueryRepository
)
export const postsController = new PostsController(
    postsServices,
    postsQueryRepository,
    commentsServices,
    commentsQueryRepository
)
export const commentsController = new CommentsController(
    commentsServices,
    commentsQueryRepository,
    likesServices
)
export const usersController = new UsersController(
    usersServices,
    usersQueryRepository
)
export const securityController = new SecurityController(
    authServices,
    securityRepository,
    securityServices,
    securityQueryRepository
)
export const authController = new AuthController(
    authServices,
    usersQueryRepository
)

