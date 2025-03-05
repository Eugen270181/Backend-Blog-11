import {Router} from 'express'
import {routersPaths} from "../../common/settings/paths";
import {securityController} from "../../ioc";

export const securityRouter = Router()

securityRouter.get(routersPaths.inSecurity, securityController.getSecurityDevicesController.bind(securityController))
securityRouter.delete(routersPaths.inSecurity, securityController.delSecurityDevicesController.bind(securityController))
securityRouter.delete(routersPaths.inSecurity+'/:id', securityController.delSecurityDeviceController.bind(securityController))


