import {body} from "express-validator";
import {LikeStatus} from "../../common/types/enum/likeStatus";

export class LikeValidation {

    likeStatusValidator = body('likeStatus').isIn(Object.values(LikeStatus))
        .withMessage(`likeStatus must be one of the following values: ${Object.values(LikeStatus).join(', ')}`);
}