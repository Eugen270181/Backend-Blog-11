"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const httpStatus_1 = require("../../../common/types/enum/httpStatus");
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
class SecurityController {
    authServices;
    securityRepository;
    securityServices;
    securityQueryRepository;
    constructor(authServices, securityRepository, securityServices, securityQueryRepository) {
        this.authServices = authServices;
        this.securityRepository = securityRepository;
        this.securityServices = securityServices;
        this.securityQueryRepository = securityQueryRepository;
    }
    async delSecurityDeviceController(req, res) {
        const sid = req.params.id;
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized); //нет RT
        const checkRT = await this.authServices.checkRefreshToken(refreshToken);
        if (checkRT.status !== resultStatus_1.ResultStatus.Success)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized); // RT не валиден
        const userId = checkRT.data.userId;
        const foundSession = await this.securityRepository.findSessionById(sid);
        if (!foundSession)
            return res.sendStatus(httpStatus_1.HttpStatus.NotFound); //не найдена сессия - sid = deviceId
        if (foundSession.userId !== userId)
            return res.sendStatus(httpStatus_1.HttpStatus.Forbidden); //userId из входного RT - !owner foundSession
        await this.securityServices.deleteSession(foundSession.deviceId);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async delSecurityDevicesController(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized); //нет RT
        const checkRT = await this.authServices.checkRefreshToken(refreshToken);
        if (checkRT.status !== resultStatus_1.ResultStatus.Success)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized); // RT не валиден
        const userId = checkRT.data.userId;
        const currentSessionId = checkRT.data.deviceId;
        await this.securityServices.deleteOtherSessions(userId, currentSessionId);
        return res.sendStatus(httpStatus_1.HttpStatus.NoContent);
    }
    async getSecurityDevicesController(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
        const checkRT = await this.authServices.checkRefreshToken(refreshToken);
        if (checkRT.status !== resultStatus_1.ResultStatus.Success)
            return res.sendStatus(httpStatus_1.HttpStatus.Unauthorized);
        const sessions = await this.securityQueryRepository.getActiveSessionsAndMap(checkRT.data.deviceId);
        return res.status(httpStatus_1.HttpStatus.Success).send(sessions);
    }
}
exports.SecurityController = SecurityController;
//# sourceMappingURL=security.controller.js.map