import {Router} from 'express'
import {adminMiddleware} from '../../common/middleware/adminMiddleware'
import {accessTokenMiddleware} from "../../common/middleware/accessTokenMiddleware";
import {commentValidators} from "../comments/middlewares/commentValidators";
import {querySortSanitizers} from "../../common/middleware/querySortSanitizerMiddleware";
import {postValidators} from "../../common/middleware/postValidatonMiddleware";
import {postsController} from "../../ioc";

export const postsRouter = Router()


postsRouter.get('/', ...querySortSanitizers, postsController.getPostsController.bind(postsController))
postsRouter.get('/:id', postsController.findPostController.bind(postsController))
postsRouter.get('/:id/comments', accessTokenMiddleware,...querySortSanitizers, postsController.getPostCommentsController.bind(postsController))
postsRouter.post('/:id/comments', accessTokenMiddleware,...commentValidators, postsController.createPostCommentController.bind(postsController))
postsRouter.post('/',  adminMiddleware, ...postValidators, postsController.createPostController.bind(postsController))
postsRouter.delete('/:id',  adminMiddleware, postsController.delPostController.bind(postsController))
postsRouter.put('/:id', adminMiddleware, ...postValidators, postsController.updatePostController.bind(postsController))

// не забудьте добавить роут в апп