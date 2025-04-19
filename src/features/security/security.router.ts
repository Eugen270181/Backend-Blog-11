import {Router} from 'express'
import {routersPaths} from "../../common/settings/paths";
import {ioc} from "../../ioc";
import {SecurityController} from "./controllers/security.controller";

export const securityRouter = Router()

const securityControllerInstance = ioc.getInstance<SecurityController>(SecurityController)

securityRouter.get(routersPaths.inSecurity, securityControllerInstance.getSecurityDevicesController.bind(securityControllerInstance))
securityRouter.delete(routersPaths.inSecurity, securityControllerInstance.delSecurityDevicesController.bind(securityControllerInstance))
securityRouter.delete(routersPaths.inSecurity+'/:id', securityControllerInstance.delSecurityDeviceController.bind(securityControllerInstance))


