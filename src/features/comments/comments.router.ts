import {Router} from 'express'
import {CommentsController} from "./controllers/comments.controller";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {container} from "../../composition-root";
import {TYPES} from "../../ioc-types";



export const commentsRouter = Router()

const guardInstance = container.get<ShieldMiddlewares>(TYPES.ShieldMiddlewares)
const validationInstance = container.get<ValidationMiddlewares>(TYPES.ValidationMiddlewares)
const commentsInstance = container.get<CommentsController>(TYPES.CommentsController)


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


