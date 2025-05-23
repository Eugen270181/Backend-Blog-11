import {HydratedDocument, model, Model, Schema} from "mongoose";
import {codeServices} from "../../../common/adapters/codeServices";
import {appConfig} from "../../../common/settings/config";
import {dateServices} from "../../../common/adapters/dateServices";


export interface IUserDto {
    login: string,
    email: string,
    hash: string
}

export type PassConfirmationModel = {
    confirmationCode: string;
    expirationDate: Date;
}

export type EmailConfirmationModel = {
    confirmationCode: string;
    expirationDate: Date;
}

export class User {
    login: string
    email: string
    passwordHash: string
    createdAt: Date
    isConfirmed: boolean
    emailConfirmation: EmailConfirmationModel | null
    passConfirmation: PassConfirmationModel | null


    static createUserBySa({ login, email, hash }:IUserDto) {
        const user = new this()

        user.login = login
        user.email = email
        user.passwordHash = hash
        user.createdAt = new Date()

        return new UserModel(user) as UserDocument
    }

    static createUserByReg({ login, email, hash }:IUserDto) {
        const userDocument = this.createUserBySa({ login, email, hash })
        const date = dateServices.genAddDate(new Date(), appConfig.EMAIL_TIME)
        const code = codeServices.genRandomCode()

        userDocument.setRegConfirmationCode( code, date)
        userDocument.isConfirmed = false

        return userDocument
    }
    activateConfirmation() {
        this.isConfirmed = true
    }
    updatePassHash(passwordHash: string) {
        this.passwordHash = passwordHash
    }
    setRegConfirmationCode(code: string, date: Date){
        this.emailConfirmation = {
            confirmationCode: code,
            expirationDate: date
        }
    }
    setPassConfirmationCode(code: string, date: Date) {
        this.passConfirmation = {
            confirmationCode: code,
            expirationDate: date
        }
    }

}
////////////////////////////////////////////////////////////////
const emailConfirmationSchema:Schema<EmailConfirmationModel>= new Schema<EmailConfirmationModel>({
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
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
    isConfirmed: { type: Boolean, required: true, default: true },
    emailConfirmation: { type: emailConfirmationSchema, nullable:true, default: null },
    passConfirmation: { type: passConfirmationSchema, nullable:true, default: null },
})

userSchema.index({ login: 1, email: 1 }, { unique: true });

userSchema.loadClass(User)

export type UserModelType = Model<User>

export type UserDocument = HydratedDocument<User>

export const UserModel:UserModelType = model<User, UserModelType>(User.name, userSchema)