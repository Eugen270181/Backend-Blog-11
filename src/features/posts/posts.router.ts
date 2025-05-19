import {Router} from 'express'
import {PostsController} from "./controllers/posts.controller";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {container} from "../../composition-root";
import {TYPES} from "../../ioc-types";



export const postsRouter = Router()

const guardInstance = container.get<ShieldMiddlewares>(TYPES.ShieldMiddlewares)
const validationInstance = container.get<ValidationMiddlewares>(TYPES.ValidationMiddlewares)
const postsInstance = container.get<PostsController>(TYPES.PostsController)


postsRouter.get('/',
    guardInstance.accessToken,
    validationInstance.querySortSanitizers,
    postsInstance.getPostsController)

postsRouter.get('/:id',
    guardInstance.accessToken,
    postsInstance.findPostController)

postsRouter.post('/',
    guardInstance.adminAccess,
    validationInstance.postValidators,
    postsInstance.createPostController)

postsRouter.delete('/:id',
    guardInstance.adminAccess,
    postsInstance.delPostController)

postsRouter.put('/:id',
    guardInstance.adminAccess,
    validationInstance.postValidators,
    postsInstance.updatePostController)
///////////////////////////////////////////
postsRouter.get('/:id/comments',
    guardInstance.accessToken,
    validationInstance.querySortSanitizers,
    postsInstance.getPostCommentsController)

postsRouter.post('/:id/comments',
    guardInstance.accessToken,
    validationInstance.commentValidators,
    postsInstance.createPostCommentController)

postsRouter.put('/:id/like-status',
    guardInstance.accessToken,
    validationInstance.likeValidators,
    postsInstance.updatePostLikeController)
