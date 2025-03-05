import {Model, Schema} from "mongoose";


export type RequestsLogModelType = Model<RequestsLog>

export type RequestsLog = {
    ip: string
    url: string
    date: Date
}

export const requestsLogSchema:Schema<RequestsLog> = new Schema<RequestsLog>({
    ip: { type: String, require: true },
    url: { type: String, require: true },
    date: { type: Date, require: true },
})