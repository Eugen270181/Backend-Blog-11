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
import {AuthController} from "./controllers/auth.controller";
import {ioc} from "../../ioc";

export const authRouter = Router()

const authControllerInstance = ioc.getInstance<AuthController>(AuthController)

//login(reqirements - Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)
authRouter.post(routersPaths.inAuth.login, rateLimitLoggerMiddleware, loginAuthValidators, authControllerInstance.loginAuthController.bind(authControllerInstance))
authRouter.get(routersPaths.inAuth.me, accessTokenMiddleware, authControllerInstance.getMeController.bind(authControllerInstance))
authRouter.post(routersPaths.inAuth.registration, rateLimitLoggerMiddleware, regAuthValidators, authControllerInstance.regAuthController.bind(authControllerInstance))
authRouter.post(routersPaths.inAuth.registrationConfirmation, rateLimitLoggerMiddleware, regConfirmAuthValidators, authControllerInstance.regConfirmAuthController.bind(authControllerInstance))
authRouter.post(routersPaths.inAuth.registrationEmailResending, rateLimitLoggerMiddleware, regEmailResendingAuthValidators, authControllerInstance.regEmailResendingAuthController.bind(authControllerInstance))
//logout(reqirements - In cookie client must send correct refreshToken that will be revoked.)
authRouter.post(routersPaths.inAuth.logout, authControllerInstance.logoutAuthController.bind(authControllerInstance))
//refresh-token(reqirements - RandomCodeServices a new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
authRouter.post(routersPaths.inAuth.refreshToken, authControllerInstance.refreshTokenAuthController.bind(authControllerInstance))
//Recovery password 2 endpoints:
authRouter.post(routersPaths.inAuth.passwordRecovery, rateLimitLoggerMiddleware, passwordRecoveryAuthValidators, authControllerInstance.passwordRecoveryAuthController.bind(authControllerInstance))
authRouter.post(routersPaths.inAuth.newPassword, rateLimitLoggerMiddleware, newPasswordAuthValidators, authControllerInstance.newPasswordAuthController.bind(authControllerInstance))
