import {UserIdType} from "./userId.type";

declare global {
    declare namespace Express {
        export interface Request {
            user: UserIdType | undefined;
        }
    }
}