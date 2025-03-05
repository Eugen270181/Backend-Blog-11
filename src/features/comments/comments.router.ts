import {Router} from 'express'
import {commentValidators} from "./middlewares/commentValidators";
import {accessTokenMiddleware} from "../../common/middleware/accessTokenMiddleware";
import {commentsController} from "../../ioc";
import {commentLikeValidators} from "./middlewares/commentLikeValidators";


export const commentsRouter = Router()

commentsRouter.put('/:id/like-status', accessTokenMiddleware,...commentLikeValidators, commentsController.updateCommentLikeController.bind(commentsController))
commentsRouter.get('/:id', accessTokenMiddleware, commentsController.findCommentController.bind(commentsController))
commentsRouter.put('/:id', accessTokenMiddleware,...commentValidators, commentsController.updateCommentController.bind(commentsController))
commentsRouter.delete('/:id', accessTokenMiddleware, commentsController.delCommentController.bind(commentsController))


