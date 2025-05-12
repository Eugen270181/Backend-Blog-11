import {LoginInputModel} from '../types/input/loginInput.model';
import {hashServices} from '../../../common/adapters/hashServices';
import {UsersRepository} from '../../users/repositories/usersRepository';
import {Result} from '../../../common/classes/result';
import {ResultStatus} from '../../../common/types/enum/resultStatus';
import {jwtServices} from "../../../common/adapters/jwtServices";
import {nodemailerServices} from "../../../common/adapters/nodemailerServices";
import {CreateUserInputModel} from "../../users/types/input/createUserInput.type";
import {appConfig} from "../../../common/settings/config";
import {SecurityRepository} from "../../security/repositories/securityRepository";
import {WithId} from "mongodb";
import {SecurityServices} from "../../security/services/securityServices";
import {emailExamples} from "../../../common/adapters/emailExamples";
import {User} from "../../users/domain/user.entity";
import {ISessionDto, Session} from "../../security/domain/session.entity";
import {ExtLoginSuccessOutputModel} from "../types/output/extLoginSuccessOutput.model";
import {UsersServices} from "../../users/services/usersServices";
import {codeServices} from "../../../common/adapters/codeServices";
import {dateServices} from "../../../common/adapters/dateServices";
import {usersRepository} from "../../../ioc";
import {UserIdType} from "../../../common/types/userId.type";

export class AuthServices {

    constructor(private securityServices: SecurityServices,
                private securityRepository: SecurityRepository,
                private usersServices: UsersServices,
                private usersRepository: UsersRepository,) {
    }

    async loginUser(login: LoginInputModel, ip: string, title: string): Promise<Result<ExtLoginSuccessOutputModel | null>> {
        const {loginOrEmail, password} = login
        const userResult = await this.checkUserCredentials(loginOrEmail, password)
        //если логин или пароль не верны или не существуют
        if (!userResult.data) {
            return Result.createErrors(ResultStatus.Unauthorized ,'Wrong credentials' ,'loginOrEmail|password' )
        }
        //если данные для входа валидны, то генеирруем deviceId и токены RT и AT, кодируя в RT payload {userId,deviceId}
        const deviceId = codeServices.genRandomCode()
        const userId = userResult.data!._id.toString()
        const generateResult: Result<ExtLoginSuccessOutputModel | null> = await this.generateTokens(userId, deviceId)
        //если проблема с генерацией токенов
        if (!generateResult.data) {
            const msgError = 'Something wrong with generate tokens, try later'
            const fldError = 'generateTokens'
            return Result.createErrors(ResultStatus.CancelledAction ,msgError ,fldError )
        }
        //создать новую сессию если генерация токенов прошла успешно
        const lastActiveDate = generateResult.data.lastActiveDate;
        const expDate = generateResult.data.expDate;
        const sessionDto: ISessionDto = {deviceId, userId, ip, title, lastActiveDate, expDate}
        const newSession = await this.securityServices.createSession(sessionDto)
        //если проблема с сохранением новой сессии
        if (!newSession) {
            const msgError = 'Something wrong with newSession saving'
            const fldError = 'saveNewSession'
            return Result.createErrors(ResultStatus.CancelledAction ,msgError ,fldError )
        }

        return Result.createSuccess<ExtLoginSuccessOutputModel>(generateResult.data)
    }

    async checkUserCredentials(loginOrEmail: string, password: string):Promise<Result< WithId<User>| null>> {
        const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
        // Проверка на наличие пользователя
        if (!user) {
            return Result.createErrors(ResultStatus.NotFound, 'User not found', 'loginOrEmail')
        }
        // Проверка пароля
        const isPassCorrect = await hashServices.checkHash(password, user.passwordHash);
        if (!isPassCorrect) {
            return Result.createErrors(ResultStatus.BadRequest, 'Wrong Password', 'password')
        }
        return Result.createSuccess<WithId<User>>(user)
    }

    //Рефрештокен кодировать с учетом userId и deviceId, а вернуть помимо токенов еще и дату их создания
    async generateTokens(userId: string, deviceId: string): Promise<Result<ExtLoginSuccessOutputModel | null>> {
        //генеирруем токены для пользователя и его deviceid
        const accessToken = await jwtServices.createAccessToken(userId)
        const refreshToken = await jwtServices.createRefreshToken(userId, deviceId)
        //записываем дату создания RT по user в соответ объект соотв коллекции бд
        const jwtPayload = await jwtServices.decodeRefreshToken(refreshToken)
        if (!jwtPayload) {
            const msgError = 'Sorry, something wrong with creation|decode refreshToken, try login later'
            const fldError = 'refreshToken'
            return Result.createErrors(ResultStatus.CancelledAction, msgError, fldError)
        }
        const lastActiveDate = new Date(jwtPayload.iat*1000)
        const expDate = new Date(jwtPayload.exp*1000)
        return Result.createSuccess<ExtLoginSuccessOutputModel>({accessToken, refreshToken, lastActiveDate, expDate})
    }

    async refreshTokens(userId: string, deviceId: string) {
        //генерируем новую пару токенов обновляем запись сессии по полю lastActiveDate и expDate
        const newTokens = await this.generateTokens(userId, deviceId);
        if (!newTokens.data) return Result.createErrors(ResultStatus.CancelledAction)
        //создать новую сессию если генерация токенов прошла успешно
        const lastActiveDate = newTokens.data.lastActiveDate;
        const expDate = newTokens.data.expDate;
        const findData = { lastActiveDate, expDate }
        const isSessionUpdated = await this.securityServices.updateSession(findData, deviceId)

        if (!isSessionUpdated) {
            const msgError = 'Sorry, something wrong with update date of new session, try again'
            const fldError = 'refreshToken'
            return Result.createErrors(ResultStatus.CancelledAction, msgError, fldError)
        }

        return Result.createSuccess<ExtLoginSuccessOutputModel>(newTokens.data)

    }

    async checkRefreshToken(refreshToken: string): Promise<Result<WithId<Session> | null>> {

        const jwtPayload = await jwtServices.verifyRefreshToken(refreshToken)

        if (!jwtPayload) return Result.createErrors(ResultStatus.Unauthorized)

        const userId = jwtPayload.userId;
        const deviceId = jwtPayload.deviceId;
        const lastActiveDate = new Date(jwtPayload.iat*1000)
        const findData = {userId, deviceId, lastActiveDate}

        const activeSession = await this.securityRepository.findActiveSession(findData)

        if (!activeSession) return Result.createErrors(ResultStatus.Unauthorized)

        return Result.createSuccess<WithId<Session>>(activeSession)

    }

    async checkAccessToken(authHeader: string) {
        const [type, token] = authHeader.split(" ")
        const jwtPayload = await jwtServices.verifyAccessToken(token)

        if (!jwtPayload) return Result.createErrors(ResultStatus.Unauthorized)
        const userId = jwtPayload.userId;
        const user = await this.usersRepository.findUserById(userId)
        if (!user) return Result.createErrors(ResultStatus.Unauthorized)

        return Result.createSuccess<UserIdType>({userId} )
    }

    async logoutUser(deviceId: string) {
        const isSessionDeleted = await this.securityServices.deleteSession(deviceId)

        if (!isSessionDeleted) {
            const msgError = 'Sorry, something wrong with delete of found session, try again'
            const fldError = 'deviceId'
            return Result.createErrors(ResultStatus.CancelledAction ,msgError ,fldError )
        }

        return Result.createSuccess()
    }

    async registerUser(user: CreateUserInputModel) {
        const {login, password, email} = user

        const foundUserByLogin = await this.usersRepository.findUserByLogin(login)
        if (foundUserByLogin) {
            return Result.createErrors(ResultStatus.BadRequest, "not unique field!", "login")
        }

        const foundUserByEmail = await this.usersRepository.findUserByEmail(email)
        if (foundUserByEmail) {
            return Result.createErrors(ResultStatus.BadRequest, "not unique field!", "email")
        }

        const passwordHash = await hashServices.getHash(password)
        const newUser = User.createUserByReg({login, email, hash: passwordHash});//create user from constructor of User Class, not from admin - UsersServices.save
        await this.usersRepository.save(newUser);

        nodemailerServices
            .sendEmail(newUser.email, emailExamples.registrationEmail(newUser.emailConfirmation!.confirmationCode))
            .catch((er) => console.error('error in send email:', er));

        return Result.createSuccess()
    }

    async resendRegCodeEmail(email: string) {
        const foundUserByEmail = await this.usersRepository.findUserByEmail(email)
        if (!foundUserByEmail) {
            return Result.createErrors(ResultStatus.BadRequest, "Email not found!", "email")
        }
        if (foundUserByEmail.isConfirmed) {
            return Result.createErrors(ResultStatus.BadRequest, "Account is confirm yet!", "isConfirmed")
        }
        const newConfirmationCode = codeServices.genRandomCode()
        const newExpirationDate = dateServices.genAddDate(new Date(),appConfig.EMAIL_TIME)

        foundUserByEmail.setRegConfirmationCode(newConfirmationCode, newExpirationDate)
        await usersRepository.save(foundUserByEmail)


        nodemailerServices
            .sendEmail(email, emailExamples.resendingCodeRegistrationEmail(newConfirmationCode))
            .catch((er) => console.error('error in send email:', er));

        return Result.createSuccess()
    }

    async confirmRegCodeEmail(code: string) {
        const user = await this.usersRepository.findUserByRegConfirmCode(code)

        if (!user) {
            return Result.createErrors(ResultStatus.BadRequest, "confirmation code is incorrect", "code")
        }
        if (user.isConfirmed) {
            return Result.createErrors(ResultStatus.BadRequest, "Account is confirm yet!", "isConfirmed")
        }
        if (user.emailConfirmation!.expirationDate < new Date()) {
            return Result.createErrors(ResultStatus.BadRequest, 'confirmation code is expired', 'code')
        }

        const activateConfirmation = await this.usersServices.activateConfirmation(user._id.toString())

        if (!activateConfirmation) {
            return Result.createErrors(ResultStatus.CancelledAction, 'Something wrong with activate your account', 'code')
        }

        return Result.createSuccess()
    }

    async resendPassCodeEmail(email: string) {
        const user = await this.usersRepository.findUserByEmail(email)
        //даже если пользователь не найден, для защиты от проверки наличия пользователя с таким e-mail, статус успеха
        if (!user) return Result.createSuccess()

        const newConfirmationCode = codeServices.genRandomCode()
        const newConfirmationDate = dateServices.genAddDate(new Date(), appConfig.PASS_TIME)
        const isUpdateConfirmationCode = await this.usersServices.setPassConfirmationCode(user._id.toString(), newConfirmationCode, newConfirmationDate)
        if (!isUpdateConfirmationCode) {
            return Result.createErrors(ResultStatus.BadRequest, 'Something wrong with recover your password, try later', 'email')
        }

        nodemailerServices
            .sendEmail(email, emailExamples.passwordRecoveryEmail(newConfirmationCode))
            .catch((er) => console.error('error in send email:', er));

        return Result.createSuccess()
    }

    async confirmPassCodeEmail(newPassword: string, recoveryCode: string) {
        const user = await this.usersRepository.findUserByPassConfirmCode(recoveryCode)

        if (!user) {
            return Result.createErrors(ResultStatus.BadRequest, 'Password confirmation code is incorrect', 'recoveryCode' )
        }
        if (user.passConfirmation!.expirationDate < new Date()) {
            return Result.createErrors(ResultStatus.BadRequest, 'Password confirmation code is expired', 'recoveryCode' )
        }

        const newPasswordHash = await hashServices.getHash(newPassword)
        const isUpdatePassHash = await this.usersServices.updatePassHash( user._id.toString(), newPasswordHash )

        if (!isUpdatePassHash) {
            const msgError = 'Something wrong with recover your password, try later'
            const fldError = 'recoveryCode'
            return Result.createErrors(ResultStatus.CancelledAction ,msgError ,fldError )
        }

        return Result.createSuccess()
    }
}