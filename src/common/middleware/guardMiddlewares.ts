import {RequestsLogsServices} from "../../features/requestLogs/services/requestsLogsServices";
import {RequestsLogsQueryRepository} from "../../features/requestLogs/repositories/requestsLogsQueryRepository";
import {AuthServices} from "../../features/auth/services/authServices";
import {NextFunction, Request, Response} from "express";
import {IReqLogDto, IReqLogQuery} from "../../features/requestLogs/domain/requestsLog.entity";
import {HttpStatus} from "../types/enum/httpStatus";
import {ResultStatus} from "../types/enum/resultStatus";

export const ADMIN_LOGIN = "admin";
export const ADMIN_PASS = "qwerty";
export const ADMIN_TOKEN = 'Basic ' + Buffer.from(`${ADMIN_LOGIN}:${ADMIN_PASS}`).toString('base64');

export class ShieldMiddlewares {
    constructor(private requestsLogsServices: RequestsLogsServices,
                private requestsLogsQueryRepository: RequestsLogsQueryRepository,
                private authServices: AuthServices) {
    }

    rateLimitLogger = async (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip ?? "unknown";
        const url = req.originalUrl;
        const date = new Date();
        const startTimeReqCounter = new Date(date.getTime() - 10000);
        const requestDto: IReqLogDto = {ip, url}
        const requestFilterDto: IReqLogQuery = {...requestDto, date: startTimeReqCounter}

        // Сохранение запроса в базе данных
        await this.requestsLogsServices.createRequestLog(requestDto)

        // Подсчет запросов за последние 10 секунд
        const requestsCounter = await this.requestsLogsQueryRepository.requestsCounter(requestFilterDto)

        //console.log(requestsCounter)

        if (requestsCounter > 5) return res.status(429).send({message: 'Превышено количество запросов. Попробуйте позже.'})

        return next(); // Передаем управление дальше
    }

    accessToken = async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            if (req.method === 'GET' && req.originalUrl !== '/auth/me') return next()
            return res.sendStatus(HttpStatus.Unauthorized)
        }

        const checkAtResult = await this.authServices.checkAccessToken(authHeader);

        if (!checkAtResult.data) {
            if (req.method === 'GET' && req.originalUrl !== '/auth/me') return next()
            return res.sendStatus(HttpStatus.Unauthorized)
        }

        req.user = {userId: checkAtResult.data.userId};
        return next();

    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) return res.sendStatus(HttpStatus.Unauthorized)

        const checkRtResult = await this.authServices.checkRefreshToken(refreshToken);

        if (!checkRtResult.data) return res.sendStatus(HttpStatus.Unauthorized)

        if (checkRtResult.status === ResultStatus.Success) {
            req.user = {userId: checkRtResult.data.userId};
            req.device = {deviceId: checkRtResult.data.deviceId}
            return next();
        }

    }

    adminAccess = async (req: Request, res: Response, next: NextFunction) => {
        if (req.headers.authorization !== ADMIN_TOKEN) return res.sendStatus(401);

        return next();
    }

}