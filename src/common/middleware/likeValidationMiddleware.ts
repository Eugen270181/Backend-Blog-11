import {body} from 'express-validator'
import {inputValidationMiddleware} from "./inputValidationMiddleware";
import {LikeStatus} from "../types/enum/likeStatus";



export const likeStatusValidator = body('likeStatus').isIn(Object.values(LikeStatus))
    .withMessage(`likeStatus must be one of the following values: ${Object.values(LikeStatus).join(', ')}`);


export const likeValidationMiddleware = [
    likeStatusValidator,

    inputValidationMiddleware
]