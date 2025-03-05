import {Router} from 'express'
import {blogValidators} from './middlewares/blogValidators'
import {adminMiddleware} from '../../common/middleware/adminMiddleware'
import {querySortSanitizers} from "../../common/middleware/querySortSanitizerMiddleware";
import {blogPostValidators} from "../../common/middleware/postValidatonMiddleware";
import {blogsController} from "../../ioc";

export const blogsRouter = Router()

blogsRouter.get('/', ...querySortSanitizers, blogsController.getBlogsController.bind(blogsController))
blogsRouter.get('/:id', blogsController.findBlogController.bind(blogsController))
blogsRouter.get('/:id/posts', ...querySortSanitizers, blogsController.findBlogPostsController.bind(blogsController))//new - task-04
blogsRouter.post('/:id/posts', adminMiddleware,...blogPostValidators, blogsController.createBlogPostController.bind(blogsController))//new - task-04
blogsRouter.post('/', adminMiddleware,...blogValidators, blogsController.createBlogController.bind(blogsController))
blogsRouter.delete('/:id', adminMiddleware, blogsController.delBlogController.bind(blogsController))
blogsRouter.put('/:id', adminMiddleware, ...blogValidators, blogsController.updateBlogController.bind(blogsController))

// не забудьте добавить роут в апп