import {body} from "express-validator";
import {injectable} from "inversify";

@injectable()
export class CommentValidation {

    contentCommentValidator = body('content').isString().withMessage('Login must be a string')
        .trim().isLength({ min: 20, max: 300 }).withMessage('Login must be between 20 and 300 characters long')

}
