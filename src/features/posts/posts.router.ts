import {Router} from 'express'
import {PostsController} from "./controllers/posts.controller";
import {ioc} from "../../ioc";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";



export const postsRouter = Router()

const guardInstance = ioc.getInstance<ShieldMiddlewares>(ShieldMiddlewares)
const validationInstance = ioc.getInstance<ValidationMiddlewares>(ValidationMiddlewares)
const postsInstance = ioc.getInstance<PostsController>(PostsController)


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
