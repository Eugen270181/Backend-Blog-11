import {Request, Response, NextFunction} from "express";

import {db} from "../../../ioc";

export const rateLimitLoggerMiddleware = async (req: Request, res: Response, next: NextFunction)=> {
        const ip = req.ip??"unknown";
        const url = req.originalUrl;
        const now = new Date();
        const startTimeReqCounter = new Date(now.getTime() - 10000);
        const requestsLogModel = db.getModels().RequestsLogModel;

        // Подсчет запросов за последние 10 секунд
        const requestCount = await requestsLogModel.countDocuments({
            ip: ip,
            url: url,
            date: { $gte: startTimeReqCounter },
        });
        //console.log(requestCount)

        if (requestCount >= 5) return res.status(429).send({ message: 'Превышено количество запросов. Попробуйте позже.'})

        // Сохранение запроса в базе данных
        await requestsLogModel.create({ ip, url, date: now });
        await requestsLogModel.deleteMany({ ip, url, date: { $lt: startTimeReqCounter } });

        return next(); // Передаем управление дальше
}
