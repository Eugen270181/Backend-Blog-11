import {Router} from 'express'
import {CommentsController} from "./controllers/comments.controller";
import {ioc} from "../../ioc";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";



export const commentsRouter = Router()

const guardInstance = ioc.getInstance<ShieldMiddlewares>(ShieldMiddlewares)
const validationInstance = ioc.getInstance<ValidationMiddlewares>(ValidationMiddlewares)
const commentsInstance = ioc.getInstance<CommentsController>(CommentsController)


commentsRouter.put('/:id/like-status',
    guardInstance.accessToken,
    validationInstance.likeValidators,
    commentsInstance.updateCommentLikeController)

commentsRouter.get('/:id',
    guardInstance.accessToken,
    commentsInstance.findCommentController)

commentsRouter.put('/:id',
    guardInstance.accessToken,
    validationInstance.commentValidators,
    commentsInstance.updateCommentController)

commentsRouter.delete('/:id',
    guardInstance.accessToken,
    commentsInstance.delCommentController)


