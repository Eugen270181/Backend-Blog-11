import {Router} from 'express'
import {ioc} from "../../ioc";
import {UsersController} from "./controllers/users.controller";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";

export const usersRouter = Router()

const guardInstance = ioc.getInstance<ShieldMiddlewares>(ShieldMiddlewares)
const validationInstance = ioc.getInstance<ValidationMiddlewares>(ValidationMiddlewares)
const usersInstance = ioc.getInstance<UsersController>(UsersController)


usersRouter.get('/',
    guardInstance.adminAccess,
    usersInstance.getUsersController)

usersRouter.post('/',
    guardInstance.adminAccess,
    validationInstance.createUserValidators,
    usersInstance.createUserController)

usersRouter.delete('/:id',
    guardInstance.adminAccess,
    usersInstance.delUserController)


