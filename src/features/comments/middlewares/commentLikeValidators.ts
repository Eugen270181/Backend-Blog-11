import {body} from 'express-validator'
import {inputValidationMiddleware} from '../../../common/middleware/inputValidationMiddleware'
import {LikeStatus} from "../../likes/domain/like.entity";


//content: string //min 20 max 300
//TODO with validation
export const likeStatusValidator = body('likeStatus').isIn(Object.values(LikeStatus))
    .withMessage(`likeStatus must be one of the following values: ${Object.values(LikeStatus).join(', ')}`);


export const commentLikeValidators = [
    likeStatusValidator,

    inputValidationMiddleware
]