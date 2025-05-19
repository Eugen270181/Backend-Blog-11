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
import {TYPES} from "./ioc-types";
//...
export const container = new Container();
//////////////////DB//////////////////////////////////////////////////////
container.bind<DB>(TYPES.DB).to(DB).inSingletonScope();
//////////////////DAL - Repositories//////////////////////////////////////
container.bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository);
container.bind<UsersQueryRepository>(TYPES.UsersQueryRepository).to(UsersQueryRepository)
container.bind<BlogsRepository>(TYPES.BlogsRepository).to(BlogsRepository)
container.bind<BlogsQueryRepository>(TYPES.BlogsQueryRepository).to(BlogsQueryRepository)
container.bind<LikesPostsRepository>(TYPES.LikesPostsRepository).to(LikesPostsRepository)
container.bind<PostsRepository>(TYPES.PostsRepository).to(PostsRepository)
container.bind<PostsQueryRepository>(TYPES.PostsQueryRepository).to(PostsQueryRepository)
container.bind<LikesCommentsRepository>(TYPES.LikesCommentsRepository).to(LikesCommentsRepository)
container.bind<CommentsRepository>(TYPES.CommentsRepository).to(CommentsRepository)
container.bind<CommentsQueryRepository>(TYPES.CommentsQueryRepository).to(CommentsQueryRepository)
container.bind<SecurityRepository>(TYPES.SecurityRepository).to(SecurityRepository)
container.bind<SecurityQueryRepository>(TYPES.SecurityQueryRepository).to(SecurityQueryRepository)
container.bind<RequestsLogsRepository>(TYPES.RequestsLogsRepository).to(RequestsLogsRepository)
container.bind<RequestsLogsQueryRepository>(TYPES.RequestsLogsQueryRepository).to(RequestsLogsQueryRepository)
//////////////////BLL - Services//////////////////////////////////////////
container.bind<UsersServices>(TYPES.UsersServices).to(UsersServices)
container.bind<BlogsServices>(TYPES.BlogsServices).to(BlogsServices)
container.bind<PostsServices>(TYPES.PostsServices).to(PostsServices)
container.bind<LikesPostsServices>(TYPES.LikesPostsServices).to(LikesPostsServices)
container.bind<CommentsServices>(TYPES.CommentsServices).to(CommentsServices)
container.bind<LikesCommentsServices>(TYPES.LikesCommentsServices).to(LikesCommentsServices)
container.bind<SecurityServices>(TYPES.SecurityServices).to(SecurityServices)
container.bind<AuthServices>(TYPES.AuthServices).to(AuthServices)
container.bind<RequestsLogsServices>(TYPES.RequestsLogsServices).to(RequestsLogsServices)
///////////////////Presentation Layer - Controllers/////////////////////////
container.bind<BlogsController>(TYPES.BlogsController).to(BlogsController)
container.bind<PostsController>(TYPES.PostsController).to(PostsController)
container.bind<CommentsController>(TYPES.CommentsController).to(CommentsController)
container.bind<UsersController>(TYPES.UsersController).to(UsersController)
container.bind<SecurityController>(TYPES.SecurityController).to(SecurityController)
container.bind<AuthController>(TYPES.AuthController).to(AuthController)
//////////////////middlewares////////////////////////////////////////////////////////
container.bind<AuthValidation>(TYPES.AuthValidation).to(AuthValidation)
container.bind<BlogValidation>(TYPES.BlogValidation).to(BlogValidation)
container.bind<PostValidation>(TYPES.PostValidation).to(PostValidation)
container.bind<CommentValidation>(TYPES.CommentValidation).to(CommentValidation)
container.bind<LikeValidation>(TYPES.LikeValidation).to(LikeValidation)
container.bind<QueryValidation>(TYPES.QueryValidation).to(QueryValidation)

container.bind<ValidationMiddlewares>(TYPES.ValidationMiddlewares).to(ValidationMiddlewares)
container.bind<ShieldMiddlewares>(TYPES.ShieldMiddlewares).to(ShieldMiddlewares)




