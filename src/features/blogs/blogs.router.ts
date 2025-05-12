import {Router} from 'express'
import {ioc} from "../../ioc";
import {BlogsController} from "./controllers/blogs.controller";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";



export const blogsRouter = Router()

const guardInstance = ioc.getInstance<ShieldMiddlewares>(ShieldMiddlewares)
const validationInstance = ioc.getInstance<ValidationMiddlewares>(ValidationMiddlewares)
const blogsInstance = ioc.getInstance<BlogsController>(BlogsController)


blogsRouter.get('/',
    validationInstance.querySortSanitizers,
    blogsInstance.getBlogsController)

blogsRouter.get('/:id',
    blogsInstance.findBlogController)

blogsRouter.get('/:id/posts',
    guardInstance.accessToken,
    validationInstance.querySortSanitizers,
    blogsInstance.findBlogPostsController)

blogsRouter.post('/:id/posts',
    guardInstance.adminAccess,
    validationInstance.blogPostValidators,
    blogsInstance.createBlogPostController)

blogsRouter.post('/',
    guardInstance.adminAccess,
    validationInstance.blogValidators,
    blogsInstance.createBlogController)

blogsRouter.delete('/:id',
    guardInstance.adminAccess,
    blogsInstance.delBlogController)

blogsRouter.put('/:id',
    guardInstance.adminAccess,
    validationInstance.blogValidators,
    blogsInstance.updateBlogController)
