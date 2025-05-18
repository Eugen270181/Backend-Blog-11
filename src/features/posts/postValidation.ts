import {body} from "express-validator";
import {BlogsRepository} from "../blogs/repositories/blogsRepository";
import {inject, injectable} from "inversify";

@injectable()
export class PostValidation {
    constructor(@inject(BlogsRepository) private blogsRepository: BlogsRepository) {}
    titleValidator = body('title').isString().withMessage('not string')
        .trim().isLength({min: 1, max: 30}).withMessage('more then 30 or 0')

    shortDescriptionValidator = body('shortDescription').isString().withMessage('not string')
        .trim().isLength({min: 1, max: 100}).withMessage('more then 100 or 0')

    contentValidator = body('content').isString().withMessage('not string')
        .trim().isLength({min: 1, max: 1000}).withMessage('more then 1000 or 0')

    blogIdValidator = body('blogId').isString().withMessage('not string')
        .trim().custom(async (blogId: string) => {
            const blog = await this.blogsRepository.findBlogById(blogId)
            if (!blog) {
                throw new Error('Incorrect blogId!')
            }
            // console.log(blog)
            return true
        }).withMessage('no blog')
}