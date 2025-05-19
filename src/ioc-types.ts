import {UsersQueryRepository} from "./features/users/repositories/usersQueryRepository";
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
import {UsersServices} from "./features/users/services/usersServices";
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
import {ValidationMiddlewares} from "./common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "./common/middleware/guardMiddlewares";
import {container} from "./composition-root";

export const TYPES = {
    DB: Symbol.for('DB'),

    UsersRepository: Symbol.for('UsersRepository'),
    UsersQueryRepository: Symbol.for('UsersQueryRepository'),
    BlogsRepository: Symbol.for('BlogsRepository'),
    BlogsQueryRepository: Symbol.for('BlogsQueryRepository'),
    LikesPostsRepository: Symbol.for('LikesPostsRepository'),
    PostsRepository: Symbol.for('PostsRepository'),
    PostsQueryRepository: Symbol.for('PostsQueryRepository'),
    LikesCommentsRepository: Symbol.for('LikesCommentsRepository'),
    CommentsRepository: Symbol.for('CommentsRepository'),
    CommentsQueryRepository: Symbol.for('CommentsQueryRepository'),
    SecurityRepository: Symbol.for('SecurityRepository'),
    SecurityQueryRepository: Symbol.for('SecurityQueryRepository'),
    RequestsLogsRepository: Symbol.for('RequestsLogsRepository'),
    RequestsLogsQueryRepository: Symbol.for('RequestsLogsQueryRepository'),

    UsersServices: Symbol.for('UsersServices'),
    BlogsServices: Symbol.for('BlogsServices'),
    PostsServices: Symbol.for('PostsServices'),
    LikesPostsServices: Symbol.for('LikesPostsServices'),
    CommentsServices: Symbol.for('CommentsServices'),
    LikesCommentsServices: Symbol.for('LikesCommentsServices'),
    SecurityServices: Symbol.for('SecurityServices'),
    AuthServices: Symbol.for('AuthServices'),
    RequestsLogsServices: Symbol.for('RequestsLogsServices'),

    BlogsController: Symbol.for('BlogsController'),
    PostsController: Symbol.for('PostsController'),
    CommentsController: Symbol.for('CommentsController'),
    UsersController: Symbol.for('UsersController'),
    SecurityController: Symbol.for('SecurityController'),
    AuthController: Symbol.for('AuthController'),

    AuthValidation: Symbol.for('AuthValidation'),
    BlogValidation: Symbol.for('BlogValidation'),
    PostValidation: Symbol.for('PostValidation'),
    CommentValidation: Symbol.for('CommentValidation'),
    LikeValidation: Symbol.for('LikeValidation'),
    QueryValidation: Symbol.for('QueryValidation'),

    ValidationMiddlewares: Symbol.for('ValidationMiddlewares'),
    ShieldMiddlewares: Symbol.for('ShieldMiddlewares'),

}