import {Router} from 'express'
import {routersPaths} from "../../common/settings/paths";
import {AuthController} from "./controllers/auth.controller";
import {ShieldMiddlewares} from "../../common/middleware/guardMiddlewares";
import {ValidationMiddlewares} from "../../common/middleware/validationMiddlewares";
import {container} from "../../composition-root";

export const authRouter = Router()

const guardInstance = container.get<ShieldMiddlewares>(ShieldMiddlewares)
const validationInstance = container.get<ValidationMiddlewares>(ValidationMiddlewares)
const authInstance = container.get<AuthController>(AuthController)


//////////////////////////USER_REGISTRATION_ACTION/////////////////
authRouter.post(routersPaths.inAuth.registration,
    guardInstance.rateLimitLogger,
    validationInstance.regAuthValidators,
    authInstance.regAuthController)

authRouter.post(routersPaths.inAuth.registrationConfirmation,
    guardInstance.rateLimitLogger,
    validationInstance.regConfirmAuthValidators,
    authInstance.regConfirmAuthController)

authRouter.post(routersPaths.inAuth.registrationEmailResending,
    guardInstance.rateLimitLogger,
    validationInstance.regEmailResendingAuthValidators,
    authInstance.regEmailResendingAuthController)
//////////////////////////USER_PASSWORD_ACTION/////////////////////
authRouter.post(routersPaths.inAuth.passwordRecovery,
    guardInstance.rateLimitLogger,
    validationInstance.passwordRecoveryAuthValidators,
    authInstance.passwordRecoveryAuthController)

authRouter.post(routersPaths.inAuth.newPassword,
    guardInstance.rateLimitLogger,
    validationInstance.newPasswordAuthValidators,
    authInstance.newPasswordAuthController)
//////////////////////////LOGIN_REGRESH_ABOUTME_LOGOUT//////////////
authRouter.post(routersPaths.inAuth.login,
    guardInstance.rateLimitLogger,
    validationInstance.loginAuthValidators,
    authInstance.loginAuthController)

authRouter.get(routersPaths.inAuth.me,
    guardInstance.accessToken,
    authInstance.getMeController)

authRouter.post(routersPaths.inAuth.refreshToken,
    guardInstance.refreshToken,
    authInstance.refreshTokenAuthController)

authRouter.post(routersPaths.inAuth.logout,
    guardInstance.refreshToken,
    authInstance.logoutAuthController)
