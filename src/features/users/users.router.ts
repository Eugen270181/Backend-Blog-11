import {Router} from 'express'
import {UsersController} from "./controllers/users.controller";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {container} from "../../composition-root";

export const usersRouter = Router()

const guardInstance = container.get<ShieldMiddlewares>(ShieldMiddlewares)
const validationInstance = container.get<ValidationMiddlewares>(ValidationMiddlewares)
const usersInstance = container.get<UsersController>(UsersController)


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


