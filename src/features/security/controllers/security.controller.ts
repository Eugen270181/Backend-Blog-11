import {RequestWithParams} from "../../../common/types/requests.type";
import {IdType} from "../../../common/types/id.type";
import {Request, Response} from "express";
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {AuthServices} from "../../auth/services/authServices";
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {SecurityRepository} from "../repositories/securityRepository";
import {SecurityServices} from "../services/securityServices";
import {SecurityOutputModel} from "../types/output/securityOutput.model";
import {SecurityQueryRepository} from "../repositories/securityQueryRepository";

export class SecurityController {
    constructor(private authServices : AuthServices,
                private securityRepository : SecurityRepository,
                private securityServices : SecurityServices,
                private securityQueryRepository : SecurityQueryRepository
    ) {}

    async delSecurityDeviceController (req: RequestWithParams<IdType>, res: Response) {
        const sid = req.params.id
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) return res.sendStatus(HttpStatus.Unauthorized) //нет RT
        const checkRT = await this.authServices.checkRefreshToken(refreshToken)
        if (checkRT.status !== ResultStatus.Success) return res.sendStatus(HttpStatus.Unauthorized) // RT не валиден
        const userId = checkRT.data!.userId

        const foundSession = await this.securityRepository.findSessionById(sid)
        if (!foundSession) return res.sendStatus(HttpStatus.NotFound) //не найдена сессия - sid = deviceId

        if (foundSession.userId !== userId) return res.sendStatus(HttpStatus.Forbidden) //userId из входного RT - !owner foundSession

        await this.securityServices.deleteSession(foundSession.deviceId)

        return  res.sendStatus(HttpStatus.NoContent)
    }
    async delSecurityDevicesController (req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) return res.sendStatus(HttpStatus.Unauthorized) //нет RT
        const checkRT = await this.authServices.checkRefreshToken(refreshToken)

        if (checkRT.status !== ResultStatus.Success) return res.sendStatus(HttpStatus.Unauthorized) // RT не валиден
        const userId = checkRT.data!.userId
        const currentSessionId = checkRT.data!.deviceId

        await this.securityServices.deleteOtherSessions(userId,currentSessionId)

        return  res.sendStatus(HttpStatus.NoContent)
    }
    async getSecurityDevicesController (req: Request, res: Response<SecurityOutputModel[]>) {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.sendStatus(HttpStatus.Unauthorized)

        const checkRT = await this.authServices.checkRefreshToken(refreshToken)
        if (checkRT.status !== ResultStatus.Success) return res.sendStatus(HttpStatus.Unauthorized)

        const sessions = await this.securityQueryRepository.getActiveSessionsAndMap(checkRT.data!.deviceId)

        return res.status(HttpStatus.Success).send(sessions)

    }
}