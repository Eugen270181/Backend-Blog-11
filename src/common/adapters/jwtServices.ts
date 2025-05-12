import jwt, {JwtPayload} from 'jsonwebtoken'
import {appConfig} from "../settings/config";



export const jwtServices = {

    async createJWT(payload: Object, secret:string, exp:string ){
        return  jwt.sign(payload, secret,{ expiresIn: exp } )
    },

    async createAccessToken(userId:string)  {
        const secret = appConfig.AT_SECRET
        const exp = appConfig.AT_TIME
        return jwtServices.createJWT({userId}, secret, exp )
    },

    async createRefreshToken(userId:string, deviceId:string)  {
        const secret = appConfig.RT_SECRET
        const exp = appConfig.RT_TIME
        return jwtServices.createJWT({userId, deviceId}, secret, exp)
    },

    async decodeRefreshToken(token:string) {
        const jwtPayload = await jwtServices.decodeToken(token)

        if(!jwtPayload || !jwtPayload?.userId || !jwtPayload?.deviceId) {
            return null
        }

        return jwtPayload as {userId: string, deviceId:string, iat:number, exp:number}
    },

    async decodeAccessToken(token:string) {
        const jwtPayload = await jwtServices.decodeToken(token)

        if(!jwtPayload || !jwtPayload?.userId) {
            return null
        }

        return jwtPayload as {userId: string}
    },

    async decodeToken(token: string):Promise<JwtPayload | null> {
        try {
            return jwt.decode(token) as JwtPayload
        } catch (e: unknown) {
            console.error("Can't decode token", e);
            return null;
        }
    },

    async verifyRefreshToken(token:string) {
        const secret = appConfig.RT_SECRET
        const result = await jwtServices.verifyToken(token, secret)
        if(!result) return null
        return jwtServices.decodeRefreshToken(token)
    },

    async verifyAccessToken(token:string) {
        const secret = appConfig.AT_SECRET
        const result = await jwtServices.verifyToken(token, secret)
        if(!result) return null
        return jwtServices.decodeAccessToken(token)
    },

    async verifyToken(token: string, secret:string):Promise<JwtPayload | null> {
        try {
            return jwt.verify(token, secret) as JwtPayload
        } catch (error) {
            console.error("Token verify some error");
            return null;
        }
    },
}