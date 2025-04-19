import {Router} from 'express'
import {blogValidators} from './middlewares/blogValidators'
import {adminMiddleware} from '../../common/middleware/adminMiddleware'
import {querySortSanitizers} from "../../common/middleware/querySortSanitizerMiddleware";
import {blogPostValidators} from "../../common/middleware/postValidatonMiddleware";
import {ioc} from "../../ioc";
import {BlogsController} from "./controllers/blogs.controller";

export const blogsRouter = Router()

const blogsControllerInstance = ioc.getInstance<BlogsController>(BlogsController)

blogsRouter.get('/', ...querySortSanitizers, blogsControllerInstance.getBlogsController.bind(blogsControllerInstance))
blogsRouter.get('/:id', blogsControllerInstance.findBlogController.bind(blogsControllerInstance))
blogsRouter.get('/:id/posts', ...querySortSanitizers, blogsControllerInstance.findBlogPostsController.bind(blogsControllerInstance))//new - task-04
blogsRouter.post('/:id/posts', adminMiddleware,...blogPostValidators, blogsControllerInstance.createBlogPostController.bind(blogsControllerInstance))//new - task-04
blogsRouter.post('/', adminMiddleware,...blogValidators, blogsControllerInstance.createBlogController.bind(blogsControllerInstance))
blogsRouter.delete('/:id', adminMiddleware, blogsControllerInstance.delBlogController.bind(blogsControllerInstance))
blogsRouter.put('/:id', adminMiddleware, ...blogValidators, blogsControllerInstance.updateBlogController.bind(blogsControllerInstance))

// не забудьте добавить роут в апп