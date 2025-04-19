import {Request, Response, NextFunction} from "express";

import {db} from "../../../ioc";


export const countHelper = {
    rateCountFunction(reqCount: number) {
        return reqCount > 5
    }
}


export const rateLimitLoggerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? "unknown";
    const url = req.originalUrl;
    const now = new Date();
    const startTimeReqCounter = new Date(now.getTime() - 10000);
    const requestsLogModel = db.getModels().RequestsLogModel;

    // Сохранение запроса в базе данных
    await requestsLogModel.create({ip, url, date: now});

    // Подсчет запросов за последние 10 секунд
    const requestCount = await requestsLogModel.countDocuments({
        ip: ip,
        url: url,
        date: {$gte: startTimeReqCounter},
    });

    //Подчищаем старые запросы в бд
    await requestsLogModel.deleteMany({ip, url, date: {$lt: startTimeReqCounter}});

    //console.log(requestCount)

    if (countHelper.rateCountFunction(requestCount)) return res.status(429).send({message: 'Превышено количество запросов. Попробуйте позже.'})


    return next(); // Передаем управление дальше
}
