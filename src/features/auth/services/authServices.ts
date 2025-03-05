import {LoginInputModel} from '../types/input/loginInput.model';
import {hashServices} from '../../../common/adapters/hashServices';
import {UsersRepository} from '../../users/repositories/usersRepository';
import {ResultClass} from '../../../common/classes/result.class';
import {ResultStatus} from '../../../common/types/enum/resultStatus';
import {jwtServices} from "../../../common/adapters/jwtServices";
import {nodemailerServices} from "../../../common/adapters/nodemailerServices";
import {CreateUserInputModel} from "../../users/types/input/createUserInput.type";
import { add } from 'date-fns/add';
import {appConfig} from "../../../common/settings/config";
import {UserIdType} from "../../../common/types/userId.type";
import {SecurityRepository} from "../../security/repositories/securityRepository";
import {WithId} from "mongodb";
import {randomUUID} from "crypto";
import {SecurityServices} from "../../security/services/securityServices";
import {emailExamples} from "../../../common/adapters/emailExamples";
import {User} from "../../users/domain/user.entity";
import {ISessionDto, Session} from "../../security/domain/session.entity";
import {ExtLoginSuccessOutputModel} from "../types/output/extLoginSuccessOutput.model";
import {durationMapper} from "../../../common/module/durationMapper";
import {UsersServices} from "../../users/services/usersServices";

export class AuthServices {

    constructor( private securityServices: SecurityServices,
                 private securityRepository: SecurityRepository,
                 private usersServices: UsersServices,
                 private usersRepository: UsersRepository, ) {}
    async loginUser(login:LoginInputModel,ip:string,title:string) {
        let result = new ResultClass<ExtLoginSuccessOutputModel>()
        const {loginOrEmail, password} = login
        const user = await this.checkUserCredentials(loginOrEmail, password)
        //если логин или пароль не верны или не существуют
        if (user.status !== ResultStatus.Success) {
            result.status = ResultStatus.Unauthorized
            result.addError('Wrong credentials','loginOrEmail|password')
            return result
        }
        //если данные для входа валидны, то генеирруем deviceId и токены RT и AT, кодируя в RT payload {userId,deviceId}
        const deviceId = randomUUID()
        const userId = user.data!._id.toString()
        //если данные для входа валидны, то генеирруем токены для пользователя и его deviceId
        result = await this.generateTokens(userId,deviceId)
        //создать новую сессию если генерация токенов прошла успешно
        if (result.data) {
            const lastActiveDate = result.data.lastActiveDate;
            const expDate = add( lastActiveDate, durationMapper(appConfig.RT_TIME) );
            const sessionDto:ISessionDto = { deviceId, userId, ip, title, lastActiveDate, expDate}
            await this.securityServices.createSession(sessionDto)
        }

        return result
    }
    async checkUserCredentials(loginOrEmail: string, password: string) {
        const result = new ResultClass<WithId<User>>()
        const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
        // Проверка на наличие пользователя
        if (!user) {
            result.status = ResultStatus.NotFound
            result.addError('User not found','loginOrEmail')
            return result
        }
        // Проверка пароля
        const isPassCorrect = await hashServices.checkHash(password, user.passwordHash);
        if (!isPassCorrect) {
            result.addError('Wrong Password','password')
            return result
        }

        return {
            status: ResultStatus.Success,
            data: user
        }
    }
    //Рефрештокен кодировать с учетом userId и deviceId, а вернуть помимо токенов еще и дату их создания
    async generateTokens(userId:string, deviceId:string){
        const result = new ResultClass<ExtLoginSuccessOutputModel>()
        //генеирруем токены для пользователя и его deviceid
        const accessToken = await jwtServices.createToken(userId, appConfig.AT_SECRET, appConfig.AT_TIME)
        const refreshToken = await jwtServices.createToken(userId, appConfig.RT_SECRET, appConfig.RT_TIME, deviceId)
        //записываем дату создания RT по user в соответ объект соотв коллекции бд
        const jwtPayload = await jwtServices.decodeToken(refreshToken)
        if (!jwtPayload) {
            result.status = ResultStatus.CancelledAction;
            result.addError('Sorry, something wrong with creation|decode refreshToken, try login later','refreshToken')
            return result
        }
        if ( !(jwtPayload as object).hasOwnProperty("userId") || !(jwtPayload as object).hasOwnProperty("deviceId")
            || !(jwtPayload as object).hasOwnProperty("iat") ) {
            result.status = ResultStatus.CancelledAction;
            result.addError('Sorry, something wrong with creation|decode refreshToken, try login later','refreshToken')
            return result
        }
        const lastActiveDate = new Date((jwtPayload.iat??0)*1000 )

        result.status = ResultStatus.Success
        result.data = {accessToken, refreshToken, lastActiveDate}

        return result
    }
    async refreshTokens(refreshToken: string){
        const result = new ResultClass<ExtLoginSuccessOutputModel>()
        const foundSession = (await this.checkRefreshToken(refreshToken)).data

        if (!foundSession) return result
        //генерируем новую пару токенов обновляем запись сессии по полю lastActiveDate и expDate
        const newTokens = await this.generateTokens(foundSession.userId,foundSession._id.toString());
        //создать новую сессию если генерация токенов прошла успешно
        if (newTokens.data) {
            const lastActiveDate = newTokens.data.lastActiveDate;
            const expDate = add( lastActiveDate, durationMapper(appConfig.RT_TIME) );
            const isSessionUpdated = await this.securityServices.updateSession({ lastActiveDate, expDate},foundSession.deviceId)
            if (isSessionUpdated) {
                result.data = newTokens.data
                result.status = ResultStatus.Success
            } else {
                result.status = ResultStatus.CancelledAction
                result.addError('Sorry, something wrong with update date of new session, try again','refreshToken')
            }
        }
        return result
    }
    async checkRefreshToken(refreshToken: string) {
        const result = new ResultClass<WithId<Session>>()
        const jwtPayload = await jwtServices.verifyToken(refreshToken, appConfig.RT_SECRET)

        if (jwtPayload) {
            if ( !(jwtPayload as object).hasOwnProperty("userId") || !(jwtPayload as object).hasOwnProperty("deviceId") )
                throw new Error( `incorrect jwt! ${JSON.stringify(jwtPayload)}` )
            const userId = jwtPayload.userId;
            const deviceId = jwtPayload.deviceId;
            const lastActiveDate = new Date( (jwtPayload.iat??0)*1000 )
            const activeSession = await this.securityRepository.findActiveSession({userId, deviceId, lastActiveDate})
            if (activeSession) {
                result.data = activeSession
                result.status = ResultStatus.Success
            }
        }

        return result
    }
    async checkAccessToken(authHeader: string) {
        const [type, token] = authHeader.split(" ")
        const result = new ResultClass<UserIdType>()
        const jwtPayload = await jwtServices.verifyToken(token, appConfig.AT_SECRET)

        if (jwtPayload) {
            if (!(jwtPayload as object).hasOwnProperty("userId")) throw new Error(`incorrect jwt! ${JSON.stringify(jwtPayload)}`)
            const userId = jwtPayload.userId;
            const user = await this.usersRepository.findUserById(userId)
            if (user) { result.data = {userId}; result.status = ResultStatus.Success }
        }

        return result
    }
    async logoutUser(refreshToken: string) {
        const currentSession= await this.checkRefreshToken(refreshToken)
        if (!currentSession.data) return false

        return this.securityServices.deleteSession(currentSession.data.deviceId)
    }
    async registerUser(user:CreateUserInputModel) {
        const {login, password, email} = user
        const result = new ResultClass()

        if (await this.usersRepository.findUserByLogin(login)) {
            result.addError("not unique field!", "login")
            return result
        }
        if (await this.usersRepository.findUserByEmail(email)) {
            result.addError("not unique field!", "email")
            return result
        }

        const passwordHash = await hashServices.getHash(password)
        const newUser = User.createUserByReg({login, email, hash:passwordHash} );//create user from constructor of User Class, not from admin - UsersServices.save

        await this.usersRepository.save(newUser);

        nodemailerServices
            .sendEmail(newUser.email, newUser.emailConfirmation.confirmationCode)
            .catch((er) => console.error('error in send email:', er));

        result.status = ResultStatus.Success
        return result
    }
    async resendRegCodeEmail(email:string) {
        const result = new ResultClass()
        const user = await this.usersRepository.findUserByEmail(email)
        if (!user) {
            result.addError("Users account with this Email not found!", "email")
            return result
        }
        if (user.emailConfirmation.isConfirmed) {
            result.addError('Users account with this email already activated!','email')
            return result
        }
        const newConfirmationCode = randomUUID()
        const newConfirmationDate =add( new Date(), durationMapper(appConfig.EMAIL_TIME) )
        const isUpdateConfirmationCode = await this.usersServices.setRegConfirmationCode(user._id.toString(),newConfirmationCode,newConfirmationDate)
        if (!isUpdateConfirmationCode) {
            result.addError('Something wrong with activate your account, try later','email')
            return result
        }
        nodemailerServices
          .sendEmail(email, emailExamples.registrationEmail(newConfirmationCode))
          .catch((er) => console.error('error in send email:', er));

        result.status = ResultStatus.Success
        return result
    }
    async confirmRegCodeEmail(code: string) {
        const result = new ResultClass()
        const user = await this.usersRepository.findUserByRegConfirmCode(code)

        if (!user) {
            result.addError('confirmation code is incorrect','code')
            return result
        }
        if (user.emailConfirmation.isConfirmed) {
            result.addError('confirmation code already been applied','code')
            return result
        }
        if (user.emailConfirmation.expirationDate < new Date()) {
            result.addError('confirmation code is expired','code')
            return result
        }

        const activateConfirmation = await this.usersServices.activateConfirmation(user._id.toString())

        if (!activateConfirmation) {
            result.addError('Something wrong with activate your account, try later','code')
            return result
        }

        result.status = ResultStatus.Success
        return result
    }
    async resendPassCodeEmail(email:string) {
        const result = new ResultClass()
        const user = await this.usersRepository.findUserByEmail(email)
        if (user) {
            const newConfirmationCode = randomUUID()
            const newConfirmationDate = add(new Date(), durationMapper(appConfig.EMAIL_TIME))
            const isUpdateConfirmationCode = await this.usersServices.setPassConfirmationCode(user._id.toString(), newConfirmationCode, newConfirmationDate)
            if (!isUpdateConfirmationCode) {
                result.addError('Something wrong with recover your password, try later', 'email')
                return result
            }
            nodemailerServices
                .sendEmail(email, emailExamples.passwordRecoveryEmail(newConfirmationCode))
                .catch((er) => console.error('error in send email:', er));
        }
        //даже если пользователь не найден, для защиты от проверки наличия пользователя с таким e-mail, статус успеха
        result.status = ResultStatus.Success
        return result
    }
    async confirmPassCodeEmail(newPassword:string, recoveryCode: string) {
        const result = new ResultClass()
        const user = await this.usersRepository.findUserByPassConfirmCode(recoveryCode)

        if (!user) {
            result.addError('Password confirmation code is incorrect','code')
            return result
        }
        if (user.passConfirmation.expirationDate < new Date()) {
            result.addError('Password confirmation code is expired','recoveryCode')
            return result
        }

        const newPasswordHash = await hashServices.getHash(newPassword)

        const isUpdatePassHash = await this.usersServices.updatePassHash(user._id.toString(), newPasswordHash)

        if (!isUpdatePassHash) {
            result.addError('Something wrong with recover your password, try later','recoveryCode')
            return result
        }

        result.status = ResultStatus.Success
        return result
    }
}