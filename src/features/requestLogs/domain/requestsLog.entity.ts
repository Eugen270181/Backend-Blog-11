import {HydratedDocument, model, Model, Schema} from "mongoose";



export type SelReqLogFilter = {
    ip?: string;
    url?: string;
    createdAt?: { $gte: Date };
};

export interface IReqLogDto {
    ip: string;
    url: string;
    // Убрали date из DTO, так как он будет устанавливаться автоматически
}

export interface IReqLogQuery {
    ip: string;
    url: string;
    date: Date
}

export class RequestLog {
    ip: string;
    url: string;
    createdAt: Date; // Добавили новое поле для TTL

    static createRequestLog({ ip, url }: IReqLogDto) {
        const requestLog = new this();
        requestLog.ip = ip;
        requestLog.url = url;
        requestLog.createdAt = new Date(); // Устанавливаем текущую дату

        return new RequestLogModel(requestLog) as RequestLogDocument;
    }
}

export const requestLogSchema = new Schema<RequestLog>({
    ip: { type: String, required: true },
    url: { type: String, required: true },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires:300
    }
});

// Добавляем TTL-индекс (документы удалятся через 1 час)
//requestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

requestLogSchema.loadClass(RequestLog);

export type RequestLogModelType = Model<RequestLog>;

export type RequestLogDocument = HydratedDocument<RequestLog>;

export const RequestLogModel:RequestLogModelType = model<RequestLog, RequestLogModelType>(RequestLog.name, requestLogSchema)