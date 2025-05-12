import {Router} from 'express'
import {clearDBTestingController} from './controllers/clearDBTestingController'
import {routersPaths} from "../../common/settings/paths";
//import {adminAccess} from "../../common/middleware/admin-middleware"
export const testingRouter = Router()

//testingRouter.use(adminAccess)
testingRouter.delete(routersPaths.inTesting, clearDBTestingController)
