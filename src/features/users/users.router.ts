import {Router} from 'express'
import {adminMiddleware} from "../../common/middleware/adminMiddleware";
import {createUserValidators} from "../../common/middleware/cerateUserOrRegValidatonMiddleware";
import {usersController} from "../../ioc";

export const usersRouter = Router()

usersRouter.get('/', usersController.getUsersController.bind(usersController))
usersRouter.post('/', adminMiddleware,...createUserValidators, usersController.createUserController.bind(usersController))
usersRouter.delete('/:id', adminMiddleware, usersController.delUserController.bind(usersController))


