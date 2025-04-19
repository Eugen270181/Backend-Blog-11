import {Router} from 'express'
import {adminMiddleware} from "../../common/middleware/adminMiddleware";
import {createUserValidators} from "../../common/middleware/cerateUserOrRegValidatonMiddleware";
import {ioc} from "../../ioc";
import {UsersController} from "./controllers/users.controller";

export const usersRouter = Router()

const usersControllerInstance = ioc.getInstance<UsersController>(UsersController)

usersRouter.get('/', adminMiddleware, usersControllerInstance.getUsersController.bind(usersControllerInstance))
usersRouter.post('/', adminMiddleware,...createUserValidators, usersControllerInstance.createUserController.bind(usersControllerInstance))
usersRouter.delete('/:id', adminMiddleware, usersControllerInstance.delUserController.bind(usersControllerInstance))


