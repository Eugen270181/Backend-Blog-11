import {Router} from 'express'
import {clearDBTestingController} from './controllers/clearDBTestingController'
import {routersPaths} from "../../common/settings/paths";
//import {adminMiddleware} from "../../common/middleware/admin-middleware"
export const testingRouter = Router()

//testingRouter.use(adminMiddleware)
testingRouter.delete(routersPaths.inTesting, clearDBTestingController)
