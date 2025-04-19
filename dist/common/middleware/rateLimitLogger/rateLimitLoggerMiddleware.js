"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitLoggerMiddleware = exports.countHelper = void 0;
const ioc_1 = require("../../../ioc");
exports.countHelper = {
    rateCountFunction(reqCount) {
        return reqCount > 5;
    }
};
const rateLimitLoggerMiddleware = async (req, res, next) => {
    const ip = req.ip ?? "unknown";
    const url = req.originalUrl;
    const now = new Date();
    const startTimeReqCounter = new Date(now.getTime() - 10000);
    const requestsLogModel = ioc_1.db.getModels().RequestsLogModel;
    // Сохранение запроса в базе данных
    await requestsLogModel.create({ ip, url, date: now });
    // Подсчет запросов за последние 10 секунд
    const requestCount = await requestsLogModel.countDocuments({
        ip: ip,
        url: url,
        date: { $gte: startTimeReqCounter },
    });
    //Подчищаем старые запросы в бд
    await requestsLogModel.deleteMany({ ip, url, date: { $lt: startTimeReqCounter } });
    //console.log(requestCount)
    if (exports.countHelper.rateCountFunction(requestCount))
        return res.status(429).send({ message: 'Превышено количество запросов. Попробуйте позже.' });
    return next(); // Передаем управление дальше
};
exports.rateLimitLoggerMiddleware = rateLimitLoggerMiddleware;
//# sourceMappingURL=rateLimitLoggerMiddleware.js.map