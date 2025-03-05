import {Router} from 'express'
import {loginAuthValidators} from "./middlewares/loginAuthValidators";
import {accessTokenMiddleware} from "../../common/middleware/accessTokenMiddleware";
import {routersPaths} from "../../common/settings/paths";
import {regConfirmAuthValidators} from "./middlewares/regConfirmAuthValidators";
import {regEmailResendingAuthValidators} from "./middlewares/regEmailResendingValidators";
import {rateLimitLoggerMiddleware} from "../../common/middleware/rateLimitLogger/rateLimitLoggerMiddleware";
import {passwordRecoveryAuthValidators} from "./middlewares/passwordRecoveryAuthValidators";
import {newPasswordAuthValidators} from "./middlewares/newPasswordAuthValidators";
import {regAuthValidators} from "../../common/middleware/cerateUserOrRegValidatonMiddleware";
import {authController} from "../../ioc";
export const authRouter = Router()

//testingRouter.use(adminMiddleware)
//login(reqirements - Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)
authRouter.post(routersPaths.inAuth.login, rateLimitLoggerMiddleware, loginAuthValidators, authController.loginAuthController.bind(authController))
authRouter.get(routersPaths.inAuth.me, accessTokenMiddleware, authController.getMeController.bind(authController))
authRouter.post(routersPaths.inAuth.registration, rateLimitLoggerMiddleware, regAuthValidators, authController.regAuthController.bind(authController))
authRouter.post(routersPaths.inAuth.registrationConfirmation, rateLimitLoggerMiddleware, regConfirmAuthValidators, authController.regConfirmAuthController.bind(authController))
authRouter.post(routersPaths.inAuth.registrationEmailResending, rateLimitLoggerMiddleware, regEmailResendingAuthValidators, authController.regEmailResendingAuthController.bind(authController))
//logout(reqirements - In cookie client must send correct refreshToken that will be revoked.)
authRouter.post(routersPaths.inAuth.logout, authController.logoutAuthController.bind(authController))
//refresh-token(reqirements - Generate a new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
authRouter.post(routersPaths.inAuth.refreshToken, authController.refreshTokenAuthController.bind(authController))
//Recovery password 2 endpoints:
authRouter.post(routersPaths.inAuth.passwordRecovery, rateLimitLoggerMiddleware, passwordRecoveryAuthValidators, authController.passwordRecoveryAuthController.bind(authController))
authRouter.post(routersPaths.inAuth.newPassword, rateLimitLoggerMiddleware, newPasswordAuthValidators, authController.newPasswordAuthController.bind(authController))
