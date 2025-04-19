"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const loginAuthValidators_1 = require("./middlewares/loginAuthValidators");
const accessTokenMiddleware_1 = require("../../common/middleware/accessTokenMiddleware");
const paths_1 = require("../../common/settings/paths");
const regConfirmAuthValidators_1 = require("./middlewares/regConfirmAuthValidators");
const regEmailResendingValidators_1 = require("./middlewares/regEmailResendingValidators");
const rateLimitLoggerMiddleware_1 = require("../../common/middleware/rateLimitLogger/rateLimitLoggerMiddleware");
const passwordRecoveryAuthValidators_1 = require("./middlewares/passwordRecoveryAuthValidators");
const newPasswordAuthValidators_1 = require("./middlewares/newPasswordAuthValidators");
const cerateUserOrRegValidatonMiddleware_1 = require("../../common/middleware/cerateUserOrRegValidatonMiddleware");
const auth_controller_1 = require("./controllers/auth.controller");
const ioc_1 = require("../../ioc");
exports.authRouter = (0, express_1.Router)();
const authControllerInstance = ioc_1.ioc.getInstance(auth_controller_1.AuthController);
//login(reqirements - Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)
exports.authRouter.post(paths_1.routersPaths.inAuth.login, rateLimitLoggerMiddleware_1.rateLimitLoggerMiddleware, loginAuthValidators_1.loginAuthValidators, authControllerInstance.loginAuthController.bind(authControllerInstance));
exports.authRouter.get(paths_1.routersPaths.inAuth.me, accessTokenMiddleware_1.accessTokenMiddleware, authControllerInstance.getMeController.bind(authControllerInstance));
exports.authRouter.post(paths_1.routersPaths.inAuth.registration, rateLimitLoggerMiddleware_1.rateLimitLoggerMiddleware, cerateUserOrRegValidatonMiddleware_1.regAuthValidators, authControllerInstance.regAuthController.bind(authControllerInstance));
exports.authRouter.post(paths_1.routersPaths.inAuth.registrationConfirmation, rateLimitLoggerMiddleware_1.rateLimitLoggerMiddleware, regConfirmAuthValidators_1.regConfirmAuthValidators, authControllerInstance.regConfirmAuthController.bind(authControllerInstance));
exports.authRouter.post(paths_1.routersPaths.inAuth.registrationEmailResending, rateLimitLoggerMiddleware_1.rateLimitLoggerMiddleware, regEmailResendingValidators_1.regEmailResendingAuthValidators, authControllerInstance.regEmailResendingAuthController.bind(authControllerInstance));
//logout(reqirements - In cookie client must send correct refreshToken that will be revoked.)
exports.authRouter.post(paths_1.routersPaths.inAuth.logout, authControllerInstance.logoutAuthController.bind(authControllerInstance));
//refresh-token(reqirements - RandomCodeServices a new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
exports.authRouter.post(paths_1.routersPaths.inAuth.refreshToken, authControllerInstance.refreshTokenAuthController.bind(authControllerInstance));
//Recovery password 2 endpoints:
exports.authRouter.post(paths_1.routersPaths.inAuth.passwordRecovery, rateLimitLoggerMiddleware_1.rateLimitLoggerMiddleware, passwordRecoveryAuthValidators_1.passwordRecoveryAuthValidators, authControllerInstance.passwordRecoveryAuthController.bind(authControllerInstance));
exports.authRouter.post(paths_1.routersPaths.inAuth.newPassword, rateLimitLoggerMiddleware_1.rateLimitLoggerMiddleware, newPasswordAuthValidators_1.newPasswordAuthValidators, authControllerInstance.newPasswordAuthController.bind(authControllerInstance));
//# sourceMappingURL=auth.router.js.map