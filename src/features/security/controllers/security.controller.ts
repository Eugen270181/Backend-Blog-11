import {RequestWithParams} from "../../../common/types/requests.type";
import {IdType} from "../../../common/types/id.type";
import {Request, Response} from "express";
import {HttpStatus} from "../../../common/types/enum/httpStatus";
import {AuthServices} from "../../auth/services/authServices";
import {SecurityRepository} from "../repositories/securityRepository";
import {SecurityServices} from "../services/securityServices";
import {SecurityOutputModel} from "../types/output/securityOutput.model";
import {SecurityQueryRepository} from "../repositories/securityQueryRepository";
import {inject, injectable} from "inversify";

@injectable()
export class SecurityController {
    constructor(@inject(AuthServices) private authServices : AuthServices,
                @inject(SecurityRepository) private securityRepository : SecurityRepository,
                @inject(SecurityServices) private securityServices : SecurityServices,
                @inject(SecurityQueryRepository) private securityQueryRepository : SecurityQueryRepository
    ) {}

    delSecurityDeviceController = async (req: RequestWithParams<IdType>, res: Response) => {
        const delDeviceId = req.params.id
        const userId = req.user?.userId as string

        const foundSession = await this.securityRepository.findSessionById(delDeviceId)
        if (!foundSession) return res.sendStatus(HttpStatus.NotFound) //не найдена сессия

        if (foundSession.userId !== userId) return res.sendStatus(HttpStatus.Forbidden) //userId из входного RT not owner foundSession

        await this.securityServices.deleteSession(delDeviceId)

        return  res.sendStatus(HttpStatus.NoContent)
    }
    delSecurityDevicesController = async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const deviceId = req.device?.deviceId as string;

        await this.securityServices.deleteOtherSessions(userId, deviceId)

        return  res.sendStatus(HttpStatus.NoContent)
    }
    getSecurityDevicesController = async (req: Request, res: Response<SecurityOutputModel[]>) => {
        const userId = req.user?.userId as string;

        const sessions = await this.securityQueryRepository.getActiveSessionsAndMap(userId)

        return res.status(HttpStatus.Success).send(sessions)

    }
}