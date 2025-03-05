import jwt, {JwtPayload} from 'jsonwebtoken'
import {IdType} from "../types/id.type";



export const jwtServices = {
    async createToken(userId: string, secretKey:string, expirationTime:string, deviceId?:string): Promise<string> {
        return jwt.sign(
            deviceId?{userId,deviceId}:{userId},
            secretKey,
            {
                expiresIn: expirationTime,
            }
        );
    },
    async decodeToken(token: string):Promise<JwtPayload | null> {
        try {
            return jwt.decode(token) as JwtPayload
        } catch (e: unknown) {
            console.error("Can't decode token", e);
            return null;
        }
    },
    async verifyToken(token: string, secretKey:string):Promise<JwtPayload | null> {
        try {
            return jwt.verify(token, secretKey) as JwtPayload
        } catch (error) {
            console.error("Token verify some error");
            return null;
        }
    },
}