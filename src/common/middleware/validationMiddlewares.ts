import {NextFunction, Request, Response} from "express";
import {ValidationError, validationResult} from "express-validator";
import {errorsMessagesType, OutputErrorsType} from "../types/outputErrors.type";
import {BlogValidation} from "../../features/blogs/blogValidation";
import {PostValidation} from "../../features/posts/postValidation";
import {LikeValidation} from "../../features/likes/likeValidation";
import {CommentValidation} from "../../features/comments/commentValidation";
import {AuthValidation} from "../../features/auth/authValidation";
import {QueryValidation} from "./queryValidation";
import {inject, injectable} from "inversify";

@injectable()
export class ValidationMiddlewares {

    constructor(@inject(AuthValidation) private authValidation: AuthValidation,
                @inject(BlogValidation) private blogValidation: BlogValidation,
                @inject(PostValidation) private postValidation: PostValidation,
                @inject(CommentValidation) private commentValidation: CommentValidation,
                @inject(LikeValidation) private likeValidation: LikeValidation,
                @inject(QueryValidation) private queryValidation: QueryValidation
    ) {}

    get querySortSanitizers() {
        return [
            this.queryValidation.pageNumberValidation,
            this.queryValidation.pageSizeValidation,
            this.queryValidation.sortByValidation,
            this.queryValidation.sortDirectionValidation
        ]
    }
    get blogValidators(){
        return [
            this.blogValidation.nameValidator,
            this.blogValidation.descriptionValidator,
            this.blogValidation.websiteUrlValidator,

            this.inputValidationMiddleware,
        ]
    }
    get postValidators() {
        return [
            this.postValidation.titleValidator,
            this.postValidation.shortDescriptionValidator,
            this.postValidation.contentValidator,
            this.postValidation.blogIdValidator,

            this.inputValidationMiddleware,
        ]
    }
    get blogPostValidators() {
        return [
            this.postValidation.titleValidator,
            this.postValidation.shortDescriptionValidator,
            this.postValidation.contentValidator,

            this.inputValidationMiddleware,
        ]
    }
    get commentValidators() {
        return  [
            this.commentValidation.contentCommentValidator,

            this.inputValidationMiddleware
        ]
    }
    get likeValidators(){
        return [
            this.likeValidation.likeStatusValidator,

            this.inputValidationMiddleware
        ]
    }
    get createUserValidators() { return this.regAuthValidators }
    get regAuthValidators() {
        return [
            this.authValidation.loginValidator,
            this.authValidation.emailRegValidator,
            this.authValidation.passwordValidator,

            this.inputValidationMiddleware,
        ]
    }
    get regEmailResendingAuthValidators(){
        return [
            this.authValidation.emailRegResendingValidator,

            this.inputValidationMiddleware,
        ]
    }
    get regConfirmAuthValidators(){
        return [
            this.authValidation.codeRegConfirmValidator,

            this.inputValidationMiddleware,
        ]
    }
    get loginAuthValidators(){
        return [
            this.authValidation.loginOrEmailValidator,

            this.inputValidationMiddleware,
        ]
    }
    get newPasswordAuthValidators(){
        return [
            this.authValidation.passwordRecoveryValidator,
            this.authValidation.codePassConfirmValidator,

            this.inputValidationMiddleware,
        ]
    }
    get passwordRecoveryAuthValidators() {
        return [
            this.authValidation.emailPassRecoveryValidator,

            this.inputValidationMiddleware,
        ]
    }

    inputValidationMiddleware = (req: Request, res: Response<OutputErrorsType>, next: NextFunction) => {
        const errorFormatter = (error: ValidationError): errorsMessagesType => {
            return {message: error.msg, field: (error.type === 'field' ? error.path : 'unknown')};
        }
        const result = validationResult(req).formatWith(errorFormatter)
        if (!result.isEmpty()) return res
            .status(400)
            .send({errorsMessages: result.array({onlyFirstError: true})})

        return next();
    }

}

