"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const httpStatus_1 = require("../../../common/types/enum/httpStatus");
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
class AuthController {
    authServices;
    usersQueryRepository;
    constructor(authServices, usersQueryRepository) {
        this.authServices = authServices;
        this.usersQueryRepository = usersQueryRepository;
    }
    async getMeController(req, res) {
        const userId = req.user?.userId;
        const meViewObject = await this.usersQueryRepository.getMapMe(userId);
        return res.status(httpStatus_1.HttpStatus.Success).send(meViewObject);
    }
    async loginAuthController(req, res) {
        const result = await this.authServices.loginUser(req.body, req.ip ?? 'unknown', req.headers["user-agent"] ?? 'unknown');
        if (result.status === resultStatus_1.ResultStatus.Unauthorized)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
        if (result.status === resultStatus_1.ResultStatus.CancelledAction)
            return res.sendStatus(httpStatus_1.HttpStatus.InternalServerError);
        res.cookie("refreshToken", result.data.refreshToken, {
            httpOnly: true,
            secure: true,
        });
        return res.status(httpStatus_1.HttpStatus.Success).send({ accessToken: result.data.accessToken });
    }
    async logoutAuthController(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
        const isLogout = await this.authServices.logoutUser(refreshToken);
        if (!isLogout)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async newPasswordAuthController(req, res) {
        const { newPassword, recoveryCode } = req.body;
        const result = await this.authServices.confirmPassCodeEmail(newPassword, recoveryCode);
        if (result.status === resultStatus_1.ResultStatus.BadRequest)
            return res.status(httpStatus_1.HttpStatus.BadRequest).send(result.errors);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async passwordRecoveryAuthController(req, res) {
        const { email } = req.body;
        const result = await this.authServices.resendPassCodeEmail(email);
        if (result.status === resultStatus_1.ResultStatus.BadRequest)
            return res.status(httpStatus_1.HttpStatus.BadRequest).send(result.errors);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async refreshTokenAuthController(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
        const result = await this.authServices.refreshTokens(refreshToken);
        if (result.status === resultStatus_1.ResultStatus.Success) {
            res.cookie("refreshToken", result.data.refreshToken, {
                httpOnly: true,
                secure: true,
            });
            return res.status(httpStatus_1.HttpStatus.Success).send({ accessToken: result.data.accessToken });
        }
        return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
    }
    async regAuthController(req, res) {
        const result = await this.authServices.registerUser(req.body);
        if (result.status === resultStatus_1.ResultStatus.BadRequest)
            return res.status(httpStatus_1.HttpStatus.BadRequest).send(result.errors);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async regConfirmAuthController(req, res) {
        const { code } = req.body;
        const result = await this.authServices.confirmRegCodeEmail(code);
        if (result.status === resultStatus_1.ResultStatus.BadRequest)
            return res.status(httpStatus_1.HttpStatus.BadRequest).send(result.errors);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async regEmailResendingAuthController(req, res) {
        const { email } = req.body;
        const result = await this.authServices.resendRegCodeEmail(email);
        if (result.status === resultStatus_1.ResultStatus.BadRequest)
            return res.status(httpStatus_1.HttpStatus.BadRequest).send(result.errors);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map