import {Router} from 'express'
import {CommentsController} from "./controllers/comments.controller";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {container} from "../../composition-root";



export const commentsRouter = Router()

const guardInstance = container.get<ShieldMiddlewares>(ShieldMiddlewares)
const validationInstance = container.get<ValidationMiddlewares>(ValidationMiddlewares)
const commentsInstance = container.get<CommentsController>(CommentsController)


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


