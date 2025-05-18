import {Router} from 'express'
import {routersPaths} from "../../common/settings/paths";
import {SecurityController} from "./controllers/security.controller";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {container} from "../../composition-root";

export const securityRouter = Router()

const guardInstance = container.get<ShieldMiddlewares>(ShieldMiddlewares)
const securityInstance = container.get<SecurityController>(SecurityController)

securityRouter.get(routersPaths.inSecurity,
    guardInstance.refreshToken,
    securityInstance.getSecurityDevicesController)

securityRouter.delete(routersPaths.inSecurity,
    guardInstance.refreshToken,
    securityInstance.delSecurityDevicesController)

securityRouter.delete(routersPaths.inSecurity+'/:id',
    guardInstance.refreshToken,
    securityInstance.delSecurityDeviceController)


