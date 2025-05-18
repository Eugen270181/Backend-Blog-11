import 'reflect-metadata';
import { Container } from 'inversify';
import {DB} from "./common/module/db/DB";
import {UsersRepository} from "./features/users/repositories/usersRepository";
import {UsersQueryRepository} from "./features/users/repositories/usersQueryRepository";
import {UsersServices} from "./features/users/services/usersServices";
import {BlogsRepository} from "./features/blogs/repositories/blogsRepository";
import {BlogsQueryRepository} from "./features/blogs/repositories/blogsQueryRepository";
import {LikesPostsRepository} from "./features/likes/repository/likesPostsRepository";
import {PostsRepository} from "./features/posts/repositories/postsRepository";
import {PostsQueryRepository} from "./features/posts/repositories/postsQueryRepository";
import {LikesCommentsRepository} from "./features/likes/repository/likesCommentsRepository";
import {CommentsRepository} from "./features/comments/repositories/commentsRepository";
import {CommentsQueryRepository} from "./features/comments/repositories/commentsQueryRepository";
import {SecurityRepository} from "./features/security/repositories/securityRepository";
import {SecurityQueryRepository} from "./features/security/repositories/securityQueryRepository";
import {RequestsLogsRepository} from "./features/requestLogs/repositories/requestsLogsRepository";
import {RequestsLogsQueryRepository} from "./features/requestLogs/repositories/requestsLogsQueryRepository";
import {BlogsServices} from "./features/blogs/services/blogsServices";
import {PostsServices} from "./features/posts/services/postsServices";
import {LikesPostsServices} from "./features/likes/services/likesPostsServices";
import {CommentsServices} from "./features/comments/services/commentsServices";
import {LikesCommentsServices} from "./features/likes/services/likesCommentsServices";
import {SecurityServices} from "./features/security/services/securityServices";
import {AuthServices} from "./features/auth/services/authServices";
import {RequestsLogsServices} from "./features/requestLogs/services/requestsLogsServices";
import {BlogsController} from "./features/blogs/controllers/blogs.controller";
import {PostsController} from "./features/posts/controllers/posts.controller";
import {CommentsController} from "./features/comments/controllers/comments.controller";
import {UsersController} from "./features/users/controllers/users.controller";
import {SecurityController} from "./features/security/controllers/security.controller";
import {AuthController} from "./features/auth/controllers/auth.controller";
import {AuthValidation} from "./features/auth/authValidation";
import {BlogValidation} from "./features/blogs/blogValidation";
import {PostValidation} from "./features/posts/postValidation";
import {CommentValidation} from "./features/comments/commentValidation";
import {LikeValidation} from "./features/likes/likeValidation";
import {QueryValidation} from "./common/middleware/queryValidation";
import {ShieldMiddlewares} from "./common/middleware/guardMiddlewares";
import {ValidationMiddlewares} from "./common/middleware/validationMiddlewares";
//...
export const container = new Container();
//////////////////DB//////////////////////////////////////////////////////
container.bind(DB).to(DB)
//////////////////DAL - Repositories//////////////////////////////////////
container.bind(UsersRepository).to(UsersRepository)
container.bind(UsersQueryRepository).to(UsersQueryRepository)
container.bind(BlogsRepository).to(BlogsRepository)
container.bind(BlogsQueryRepository).to(BlogsQueryRepository)
container.bind(LikesPostsRepository).to(LikesPostsRepository)
container.bind(PostsRepository).to(PostsRepository)
container.bind(PostsQueryRepository).to(PostsQueryRepository)
container.bind(LikesCommentsRepository).to(LikesCommentsRepository)
container.bind(CommentsRepository).to(CommentsRepository)
container.bind(CommentsQueryRepository).to(CommentsQueryRepository)
container.bind(SecurityRepository).to(SecurityRepository)
container.bind(SecurityQueryRepository).to(SecurityQueryRepository)
container.bind(RequestsLogsRepository).to(RequestsLogsRepository)
container.bind(RequestsLogsQueryRepository).to(RequestsLogsQueryRepository)
//////////////////BLL - Services//////////////////////////////////////////
container.bind(UsersServices).to(UsersServices)
container.bind(BlogsServices).to(BlogsServices)
container.bind(PostsServices).to(PostsServices)
container.bind(LikesPostsServices).to(LikesPostsServices)
container.bind(CommentsServices).to(CommentsServices)
container.bind(LikesCommentsServices).to(LikesCommentsServices)
container.bind(SecurityServices).to(SecurityServices)
container.bind(AuthServices).to(AuthServices)
container.bind(RequestsLogsServices).to(RequestsLogsServices)
///////////////////Presentation Layer - Controllers/////////////////////////
container.bind(BlogsController).to(BlogsController)
container.bind(PostsController).to(PostsController)
container.bind(CommentsController).to(CommentsController)
container.bind(UsersController).to(UsersController)
container.bind(SecurityController).to(SecurityController)
container.bind(AuthController).to(AuthController)
//////////////////middlewares////////////////////////////////////////////////////////
container.bind(AuthValidation).to(AuthValidation)
container.bind(BlogValidation).to(BlogValidation)
container.bind(PostValidation).to(PostValidation)
container.bind(CommentValidation).to(CommentValidation)
container.bind(LikeValidation).to(LikeValidation)
container.bind(QueryValidation).to(QueryValidation)

container.bind(ValidationMiddlewares).to(ValidationMiddlewares)
container.bind(ShieldMiddlewares).to(ShieldMiddlewares)


