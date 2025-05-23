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
import {LikesCommentsServices} from "./features/likes/services/likesCommentsServices";
import {LikesCommentsRepository} from "./features/likes/repository/likesCommentsRepository";
import {DB} from "./common/module/db/DB";
import {LikesPostsRepository} from "./features/likes/repository/likesPostsRepository";
import {LikesPostsServices} from "./features/likes/services/likesPostsServices";
import {RequestsLogsRepository} from "./features/requestLogs/repositories/requestsLogsRepository";
import {RequestsLogsServices} from "./features/requestLogs/services/requestsLogsServices";
import {RequestsLogsQueryRepository} from "./features/requestLogs/repositories/requestsLogsQueryRepository";
import {PostValidation} from "./features/posts/postValidation";
import {BlogValidation} from "./features/blogs/blogValidation";
import {LikeValidation} from "./features/likes/likeValidation";
import {AuthValidation} from "./features/auth/authValidation";
import {CommentValidation} from "./features/comments/commentValidation";
import {ShieldMiddlewares} from "./common/middleware/guardMiddlewares";
import {QueryValidation} from "./common/middleware/queryValidation";
import {ValidationMiddlewares} from "./common/middleware/validationMiddlewares";


const objects: any[] = []
//////////////////DB//////////////////////////////////////////////////////
export const db = new DB(); objects.push(db);
//////////////////DAL - Repositories//////////////////////////////////////
export const usersRepository = new UsersRepository(db); objects.push(usersRepository);
export const usersQueryRepository = new UsersQueryRepository(db) ;objects.push(usersQueryRepository);
export const blogsRepository = new BlogsRepository(db); objects.push(blogsRepository);
export const blogsQueryRepository = new BlogsQueryRepository(db); objects.push(blogsQueryRepository);
export const likesPostsRepository = new LikesPostsRepository(db); objects.push(likesPostsRepository);
export const postsRepository = new PostsRepository(db); objects.push(postsRepository);
export const postsQueryRepository = new PostsQueryRepository(db, likesPostsRepository, usersQueryRepository); objects.push(postsQueryRepository);
export const likesCommentsRepository = new LikesCommentsRepository(db); objects.push(likesCommentsRepository);
export const commentsRepository = new CommentsRepository(db); objects.push(commentsRepository);
export const commentsQueryRepository = new CommentsQueryRepository(db, likesCommentsRepository); objects.push(commentsQueryRepository);
export const securityRepository = new SecurityRepository(db) ;objects.push(securityRepository);
export const securityQueryRepository = new SecurityQueryRepository(db) ;objects.push(securityQueryRepository);
export const requestsLogsRepository = new RequestsLogsRepository(db) ;objects.push(requestsLogsRepository);
export const requestsLogsQueryRepository = new RequestsLogsQueryRepository(db) ;objects.push(requestsLogsQueryRepository);
//////////////////BLL - Services//////////////////////////////////////////////////////////////////////////////////////////////////////
export const usersServices = new UsersServices(usersRepository) ;objects.push(usersServices);
export const blogsServices = new BlogsServices(blogsRepository) ;objects.push(blogsServices);
export const postsServices = new PostsServices(blogsRepository, postsRepository) ;objects.push(postsServices);
export const likesPostsServices = new LikesPostsServices(likesPostsRepository, usersRepository, postsRepository) ;objects.push(likesPostsServices);
export const commentsServices = new CommentsServices(commentsRepository, postsRepository, usersRepository) ;objects.push(commentsServices);
export const likesCommentsServices = new LikesCommentsServices(likesCommentsRepository, usersRepository, commentsRepository) ;objects.push(likesCommentsServices);
export const securityServices = new SecurityServices(securityRepository) ;objects.push(securityServices);
export const authServices = new AuthServices(securityServices, securityRepository, usersServices, usersRepository) ;objects.push(authServices);
export const requestsLogsServices = new RequestsLogsServices(requestsLogsRepository);objects.push(requestsLogsServices);
///////////////////Presentation Layer - Controllers/////////////////////////
export const blogsControllerInstance = new BlogsController(
    blogsServices,
    blogsQueryRepository,
    postsServices,
    postsQueryRepository
)
objects.push(blogsControllerInstance)
export const postsControllerInstance = new PostsController(
    postsServices,
    postsQueryRepository,
    commentsServices,
    commentsQueryRepository,
    likesPostsServices
)
objects.push(postsControllerInstance)
export const commentsControllerInstance = new CommentsController(
    commentsServices,
    commentsQueryRepository,
    likesCommentsServices
)
objects.push(commentsControllerInstance)
export const usersControllerInstance = new UsersController(
    usersServices,
    usersQueryRepository
)
objects.push(usersControllerInstance)
export const securityControllerInstance = new SecurityController(
    authServices,
    securityRepository,
    securityServices,
    securityQueryRepository
)
objects.push(securityControllerInstance)
export const authControllerInstance = new AuthController(
    authServices,
    usersQueryRepository
)
objects.push(authControllerInstance)
//////////////////middlewares////////////////////////////////////////////////////////
export const shieldMiddlewaresInstance = new ShieldMiddlewares(
    requestsLogsServices,    requestsLogsQueryRepository,
    authServices
)
objects.push(shieldMiddlewaresInstance)

export const authValidatorsInstance = new AuthValidation(usersRepository);objects.push(authValidatorsInstance);
export const blogValidatorsInstance = new BlogValidation();objects.push(blogValidatorsInstance)
export const postValidatorsInstance = new PostValidation(blogsRepository);objects.push(postValidatorsInstance)
export const commentValidatorsInstance = new CommentValidation();objects.push(commentValidatorsInstance)
export const likeValidatorsInstance = new LikeValidation();objects.push(likeValidatorsInstance)
export const queryValidatorsInstance= new QueryValidation();objects.push()

export const validationMiddlewaresInstance = new ValidationMiddlewares(
    authValidatorsInstance,
    blogValidatorsInstance,
    postValidatorsInstance,
    commentValidatorsInstance,
    likeValidatorsInstance,
    queryValidatorsInstance
)
objects.push(validationMiddlewaresInstance)
//////////////////////////IoC Container - метод получить заранее созданый объект из массива объектов////////////////////////
export const manualContainer = {
    get<T>(ClassType: any) {
        const targetInstance = objects.find((object) => object instanceof ClassType);

        return targetInstance as T;
    },
};