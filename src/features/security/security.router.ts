import {Router} from 'express'
import {routersPaths} from "../../common/settings/paths";
import {ioc} from "../../ioc";
import {SecurityController} from "./controllers/security.controller";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";

export const securityRouter = Router()

const guardInstance = ioc.getInstance<ShieldMiddlewares>(ShieldMiddlewares)
const securityInstance = ioc.getInstance<SecurityController>(SecurityController)

securityRouter.get(routersPaths.inSecurity,
    guardInstance.refreshToken,
    securityInstance.getSecurityDevicesController)

securityRouter.delete(routersPaths.inSecurity,
    guardInstance.refreshToken,
    securityInstance.delSecurityDevicesController)

securityRouter.delete(routersPaths.inSecurity+'/:id',
    guardInstance.refreshToken,
    securityInstance.delSecurityDeviceController)


