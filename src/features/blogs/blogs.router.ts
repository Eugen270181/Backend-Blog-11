import {Router} from 'express'
import {BlogsController} from "./controllers/blogs.controller";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {container} from "../../composition-root";
import {TYPES} from "../../ioc-types";



export const blogsRouter = Router()

const guardInstance = container.get<ShieldMiddlewares>(TYPES.ShieldMiddlewares)
const validationInstance = container.get<ValidationMiddlewares>(TYPES.ValidationMiddlewares)
const blogsInstance = container.get<BlogsController>(TYPES.BlogsController)


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
