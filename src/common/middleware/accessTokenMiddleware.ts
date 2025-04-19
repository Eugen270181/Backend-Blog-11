import {Response, Request, NextFunction} from 'express'
import {HttpStatus} from "../types/enum/httpStatus";
import {ResultStatus} from "../types/enum/resultStatus";
import {authServices} from "../../ioc";

export const accessTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        if (req.method === 'GET') return next()
        return res.sendStatus(HttpStatus.Unauthorized)
    }

    const result = await authServices.checkAccessToken(authHeader);

    if (result.status === ResultStatus.Success) {
        req.user = {userId:result.data!.userId};
        return next();
    }

    if (req.method === 'GET') return next()

    return res.sendStatus(HttpStatus.Unauthorized)
}