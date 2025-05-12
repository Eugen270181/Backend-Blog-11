import {UserIdType} from "./userId.type";
import {DeviceIdType} from "./deviceId.type";

declare global {
    declare namespace Express {
        export interface Request {
            user: UserIdType | undefined;
            device: DeviceIdType | undefined;
        }
    }
}