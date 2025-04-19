import {Router} from 'express'
import {adminMiddleware} from '../../common/middleware/adminMiddleware'
import {accessTokenMiddleware} from "../../common/middleware/accessTokenMiddleware";
import {commentValidators} from "../comments/middlewares/commentValidators";
import {querySortSanitizers} from "../../common/middleware/querySortSanitizerMiddleware";
import {postValidators} from "../../common/middleware/postValidatonMiddleware";
import {PostsController} from "./controllers/posts.controller";
import {ioc} from "../../ioc";
import {likeValidationMiddleware} from "../../common/middleware/likeValidationMiddleware";


export const postsRouter = Router()

const postsControllerInstance = ioc.getInstance<PostsController>(PostsController)

postsRouter.get('/', ...querySortSanitizers, postsControllerInstance.getPostsController.bind(postsControllerInstance))
postsRouter.get('/:id', postsControllerInstance.findPostController.bind(postsControllerInstance))
postsRouter.get('/:id/comments', accessTokenMiddleware,...querySortSanitizers, postsControllerInstance.getPostCommentsController.bind(postsControllerInstance))
postsRouter.post('/:id/comments', accessTokenMiddleware,...commentValidators, postsControllerInstance.createPostCommentController.bind(postsControllerInstance))
postsRouter.post('/',  adminMiddleware, ...postValidators, postsControllerInstance.createPostController.bind(postsControllerInstance))
postsRouter.delete('/:id',  adminMiddleware, postsControllerInstance.delPostController.bind(postsControllerInstance))
postsRouter.put('/:id', adminMiddleware, ...postValidators, postsControllerInstance.updatePostController.bind(postsControllerInstance))
postsRouter.put('/:id/like-status', accessTokenMiddleware,...likeValidationMiddleware, postsControllerInstance.updatePostLikeController.bind(postsControllerInstance))

// не забудьте добавить роут в апп