import {Router} from 'express'
import {commentValidators} from "./middlewares/commentValidators";
import {accessTokenMiddleware} from "../../common/middleware/accessTokenMiddleware";
import {CommentsController} from "./controllers/comments.controller";
import {ioc} from "../../ioc";
import {likeValidationMiddleware} from "../../common/middleware/likeValidationMiddleware";


export const commentsRouter = Router()

const commentsControllerInstance = ioc.getInstance<CommentsController>(CommentsController);

commentsRouter.put('/:id/like-status', accessTokenMiddleware,...likeValidationMiddleware, commentsControllerInstance.updateCommentLikeController.bind(commentsControllerInstance))
commentsRouter.get('/:id', accessTokenMiddleware, commentsControllerInstance.findCommentController.bind(commentsControllerInstance))
commentsRouter.put('/:id', accessTokenMiddleware,...commentValidators, commentsControllerInstance.updateCommentController.bind(commentsControllerInstance))
commentsRouter.delete('/:id', accessTokenMiddleware, commentsControllerInstance.delCommentController.bind(commentsControllerInstance))


