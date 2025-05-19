import {Router} from 'express'
import {UsersController} from "./controllers/users.controller";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {container} from "../../composition-root";
import {TYPES} from "../../ioc-types";

export const usersRouter = Router()

const guardInstance = container.get<ShieldMiddlewares>(TYPES.ShieldMiddlewares)
const validationInstance = container.get<ValidationMiddlewares>(TYPES.ValidationMiddlewares)
const usersInstance = container.get<UsersController>(TYPES.UsersController)


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


