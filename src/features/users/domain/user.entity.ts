import {add} from "date-fns/add";
import {randomUUID} from "crypto";
import {HydratedDocument, Model, Schema} from "mongoose";

import {db} from "../../../ioc";


export interface IUserDto {
    login: string,
    email: string,
    hash: string
}
export type EmailConfirmationModel = {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
}
export type PassConfirmationModel = {
    confirmationCode: string;
    expirationDate: Date;
}


export class User {
    login: string
    email: string
    passwordHash: string
    createdAt: Date
    emailConfirmation: EmailConfirmationModel
    passConfirmation: PassConfirmationModel


    static createUserBySa({ login, email, hash }:IUserDto) {
        const user = new this()

        user.login = login
        user.email = email
        user.passwordHash = hash
        user.createdAt = new Date()
        user.emailConfirmation = {
            expirationDate: new Date(),
            confirmationCode: ``,
            isConfirmed: true
        }
        user.passConfirmation = {
            confirmationCode: '',
            expirationDate: new Date()
        }

        const userModel = db.getModels().UserModel

        return new userModel(user) as UserDocument
    }

    static createUserByReg({ login, email, hash }:IUserDto) {
        const userDocument = this.createUserBySa({ login, email, hash })
        userDocument.emailConfirmation.expirationDate = add(new Date(), {hours:1, minutes:30})
        userDocument.emailConfirmation.confirmationCode = randomUUID()
        userDocument.emailConfirmation.isConfirmed = false

        return userDocument
    }
    activateConfirmation() {
        this.emailConfirmation.isConfirmed = true
    }
    updatePassHash(passwordHash: string) {
        this.passwordHash = passwordHash
    }
    setRegConfirmationCode(code: string, date: Date){
        this.emailConfirmation.confirmationCode = code
        this.emailConfirmation.expirationDate = date
    }
    setPassConfirmationCode(code, date) {
        this.passConfirmation.confirmationCode = code
        this.passConfirmation.expirationDate = date
    }

}
////////////////////////////////////////////////////////////////
const emailConfirmationSchema:Schema<EmailConfirmationModel> = new Schema<EmailConfirmationModel> ({
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    isConfirmed: { type: Boolean, required: true },
}, {_id:false})
const passConfirmationSchema:Schema<PassConfirmationModel>= new Schema<PassConfirmationModel>({
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
}, {_id:false})
export const userSchema:Schema<User> = new Schema<User>({
    login: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, required: true },
    emailConfirmation: { type: emailConfirmationSchema },
    passConfirmation: { type: passConfirmationSchema },
})

userSchema.loadClass(User)

export type UserModelType = Model<User>

export type UserDocument = HydratedDocument<User>