"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const hashServices_1 = require("../../../common/adapters/hashServices");
const result_class_1 = require("../../../common/classes/result.class");
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
const jwtServices_1 = require("../../../common/adapters/jwtServices");
const nodemailerServices_1 = require("../../../common/adapters/nodemailerServices");
const add_1 = require("date-fns/add");
const config_1 = require("../../../common/settings/config");
const emailExamples_1 = require("../../../common/adapters/emailExamples");
const user_entity_1 = require("../../users/domain/user.entity");
const durationMapper_1 = require("../../../common/module/durationMapper");
const randomCodeServices_1 = require("../../../common/adapters/randomCodeServices");
class AuthServices {
    securityServices;
    securityRepository;
    usersServices;
    usersRepository;
    constructor(securityServices, securityRepository, usersServices, usersRepository) {
        this.securityServices = securityServices;
        this.securityRepository = securityRepository;
        this.usersServices = usersServices;
        this.usersRepository = usersRepository;
    } //TODO Mocks NodeMailer DI
    async loginUser(login, ip, title) {
        let result = new result_class_1.ResultClass();
        const { loginOrEmail, password } = login;
        const user = await this.checkUserCredentials(loginOrEmail, password);
        //если логин или пароль не верны или не существуют
        if (user.status !== resultStatus_1.ResultStatus.Success) {
            result.status = resultStatus_1.ResultStatus.Unauthorized;
            result.addError('Wrong credentials', 'loginOrEmail|password');
            return result;
        }
        //если данные для входа валидны, то генеирруем deviceId и токены RT и AT, кодируя в RT payload {userId,deviceId}
        const deviceId = randomCodeServices_1.RandomCodeServices.genRandomCode();
        const userId = user.data._id.toString();
        //если данные для входа валидны, то генеирруем токены для пользователя и его deviceId
        result = await this.generateTokens(userId, deviceId);
        //создать новую сессию если генерация токенов прошла успешно
        if (result.data) {
            const lastActiveDate = result.data.lastActiveDate;
            const expDate = (0, add_1.add)(lastActiveDate, (0, durationMapper_1.durationMapper)(config_1.appConfig.RT_TIME));
            const sessionDto = { deviceId, userId, ip, title, lastActiveDate, expDate };
            await this.securityServices.createSession(sessionDto);
        }
        return result;
    }
    async checkUserCredentials(loginOrEmail, password) {
        const result = new result_class_1.ResultClass();
        const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
        // Проверка на наличие пользователя
        if (!user) {
            result.status = resultStatus_1.ResultStatus.NotFound;
            result.addError('User not found', 'loginOrEmail');
            return result;
        }
        // Проверка пароля
        const isPassCorrect = await hashServices_1.hashServices.checkHash(password, user.passwordHash);
        if (!isPassCorrect) {
            result.addError('Wrong Password', 'password');
            return result;
        }
        return {
            status: resultStatus_1.ResultStatus.Success,
            data: user
        };
    }
    //Рефрештокен кодировать с учетом userId и deviceId, а вернуть помимо токенов еще и дату их создания
    async generateTokens(userId, deviceId) {
        const result = new result_class_1.ResultClass();
        //генеирруем токены для пользователя и его deviceid
        const accessToken = await jwtServices_1.jwtServices.createToken(userId, config_1.appConfig.AT_SECRET, config_1.appConfig.AT_TIME);
        const refreshToken = await jwtServices_1.jwtServices.createToken(userId, config_1.appConfig.RT_SECRET, config_1.appConfig.RT_TIME, deviceId);
        //записываем дату создания RT по user в соответ объект соотв коллекции бд
        const jwtPayload = await jwtServices_1.jwtServices.decodeToken(refreshToken);
        if (!jwtPayload) {
            result.status = resultStatus_1.ResultStatus.CancelledAction;
            result.addError('Sorry, something wrong with creation|decode refreshToken, try login later', 'refreshToken');
            return result;
        }
        if (!jwtPayload.hasOwnProperty("userId") || !jwtPayload.hasOwnProperty("deviceId")
            || !jwtPayload.hasOwnProperty("iat")) {
            result.status = resultStatus_1.ResultStatus.CancelledAction;
            result.addError('Sorry, something wrong with creation|decode refreshToken, try login later', 'refreshToken');
            return result;
        }
        const lastActiveDate = new Date((jwtPayload.iat ?? 0) * 1000);
        result.status = resultStatus_1.ResultStatus.Success;
        result.data = { accessToken, refreshToken, lastActiveDate };
        return result;
    }
    async refreshTokens(refreshToken) {
        const result = new result_class_1.ResultClass();
        const foundSession = (await this.checkRefreshToken(refreshToken)).data;
        if (!foundSession)
            return result;
        //генерируем новую пару токенов обновляем запись сессии по полю lastActiveDate и expDate
        const newTokens = await this.generateTokens(foundSession.userId, foundSession._id.toString());
        //создать новую сессию если генерация токенов прошла успешно
        if (newTokens.data) {
            const lastActiveDate = newTokens.data.lastActiveDate;
            const expDate = (0, add_1.add)(lastActiveDate, (0, durationMapper_1.durationMapper)(config_1.appConfig.RT_TIME));
            const isSessionUpdated = await this.securityServices.updateSession({ lastActiveDate, expDate }, foundSession.deviceId);
            if (isSessionUpdated) {
                result.data = newTokens.data;
                result.status = resultStatus_1.ResultStatus.Success;
            }
            else {
                result.status = resultStatus_1.ResultStatus.CancelledAction;
                result.addError('Sorry, something wrong with update date of new session, try again', 'refreshToken');
            }
        }
        return result;
    }
    async checkRefreshToken(refreshToken) {
        const result = new result_class_1.ResultClass();
        const jwtPayload = await jwtServices_1.jwtServices.verifyToken(refreshToken, config_1.appConfig.RT_SECRET);
        if (jwtPayload) {
            if (!jwtPayload.hasOwnProperty("userId") || !jwtPayload.hasOwnProperty("deviceId"))
                throw new Error(`incorrect jwt! ${JSON.stringify(jwtPayload)}`);
            const userId = jwtPayload.userId;
            const deviceId = jwtPayload.deviceId;
            const lastActiveDate = new Date((jwtPayload.iat ?? 0) * 1000);
            const activeSession = await this.securityRepository.findActiveSession({ userId, deviceId, lastActiveDate });
            if (activeSession) {
                result.data = activeSession;
                result.status = resultStatus_1.ResultStatus.Success;
            }
        }
        return result;
    }
    async checkAccessToken(authHeader) {
        const [type, token] = authHeader.split(" ");
        const result = new result_class_1.ResultClass();
        const jwtPayload = await jwtServices_1.jwtServices.verifyToken(token, config_1.appConfig.AT_SECRET);
        if (jwtPayload) {
            if (!jwtPayload.hasOwnProperty("userId"))
                throw new Error(`incorrect jwt! ${JSON.stringify(jwtPayload)}`);
            const userId = jwtPayload.userId;
            const user = await this.usersRepository.findUserById(userId);
            if (user) {
                result.data = { userId };
                result.status = resultStatus_1.ResultStatus.Success;
            }
        }
        return result;
    }
    async logoutUser(refreshToken) {
        const currentSession = await this.checkRefreshToken(refreshToken);
        if (!currentSession.data)
            return false;
        return this.securityServices.deleteSession(currentSession.data.deviceId);
    }
    async registerUser(user) {
        const { login, password, email } = user;
        const result = new result_class_1.ResultClass();
        if (await this.usersRepository.findUserByLogin(login)) {
            result.addError("not unique field!", "login");
            return result;
        }
        if (await this.usersRepository.findUserByEmail(email)) {
            result.addError("not unique field!", "email");
            return result;
        }
        const passwordHash = await hashServices_1.hashServices.getHash(password);
        const newUser = user_entity_1.User.createUserByReg({ login, email, hash: passwordHash }); //create user from constructor of User Class, not from admin - UsersServices.save
        await this.usersRepository.save(newUser);
        nodemailerServices_1.nodemailerServices
            .sendEmail(newUser.email, emailExamples_1.emailExamples.registrationEmail(newUser.emailConfirmation.confirmationCode))
            .catch((er) => console.error('error in send email:', er));
        result.status = resultStatus_1.ResultStatus.Success;
        return result;
    }
    async resendRegCodeEmail(email) {
        const result = new result_class_1.ResultClass();
        const user = await this.usersRepository.findUserByEmail(email);
        if (!user) {
            result.addError("Users account with this Email not found!", "email");
            return result;
        }
        if (user.isConfirmed) {
            result.addError('Users account with this email already activated!', 'email');
            return result;
        }
        const newConfirmationCode = randomCodeServices_1.RandomCodeServices.genRandomCode();
        const newConfirmationDate = (0, add_1.add)(new Date(), (0, durationMapper_1.durationMapper)(config_1.appConfig.EMAIL_TIME));
        const isUpdateConfirmationCode = await this.usersServices.setRegConfirmationCode(user._id.toString(), newConfirmationCode, newConfirmationDate);
        if (!isUpdateConfirmationCode) {
            result.addError('Something wrong with activate your account, try later', 'email');
            return result;
        }
        nodemailerServices_1.nodemailerServices
            .sendEmail(email, emailExamples_1.emailExamples.resendingCodeRegistrationEmail(newConfirmationCode))
            .catch((er) => console.error('error in send email:', er));
        result.status = resultStatus_1.ResultStatus.Success;
        return result;
    }
    async confirmRegCodeEmail(code) {
        const result = new result_class_1.ResultClass();
        const user = await this.usersRepository.findUserByRegConfirmCode(code);
        if (!user) {
            result.addError('confirmation code is incorrect', 'code');
            return result;
        }
        if (user.isConfirmed) {
            result.addError('confirmation code already been applied', 'code');
            return result;
        }
        if (user.emailConfirmation.expirationDate < new Date()) {
            result.addError('confirmation code is expired', 'code');
            return result;
        }
        const activateConfirmation = await this.usersServices.activateConfirmation(user._id.toString());
        if (!activateConfirmation) {
            result.addError('Something wrong with activate your account, try later', 'code');
            return result;
        }
        result.status = resultStatus_1.ResultStatus.Success;
        return result;
    }
    async resendPassCodeEmail(email) {
        const result = new result_class_1.ResultClass();
        const user = await this.usersRepository.findUserByEmail(email);
        if (user) {
            const newConfirmationCode = randomCodeServices_1.RandomCodeServices.genRandomCode();
            const newConfirmationDate = (0, add_1.add)(new Date(), (0, durationMapper_1.durationMapper)(config_1.appConfig.PASS_TIME));
            const isUpdateConfirmationCode = await this.usersServices.setPassConfirmationCode(user._id.toString(), newConfirmationCode, newConfirmationDate);
            if (!isUpdateConfirmationCode) {
                result.addError('Something wrong with recover your password, try later', 'email');
                return result;
            }
            nodemailerServices_1.nodemailerServices
                .sendEmail(email, emailExamples_1.emailExamples.passwordRecoveryEmail(newConfirmationCode))
                .catch((er) => console.error('error in send email:', er));
        }
        //даже если пользователь не найден, для защиты от проверки наличия пользователя с таким e-mail, статус успеха
        result.status = resultStatus_1.ResultStatus.Success;
        return result;
    }
    async confirmPassCodeEmail(newPassword, recoveryCode) {
        const result = new result_class_1.ResultClass();
        const user = await this.usersRepository.findUserByPassConfirmCode(recoveryCode);
        if (!user) {
            result.addError('Password confirmation code is incorrect', 'code');
            return result;
        }
        if (user.passConfirmation.expirationDate < new Date()) {
            result.addError('Password confirmation code is expired', 'recoveryCode');
            return result;
        }
        const newPasswordHash = await hashServices_1.hashServices.getHash(newPassword);
        const isUpdatePassHash = await this.usersServices.updatePassHash(user._id.toString(), newPasswordHash);
        if (!isUpdatePassHash) {
            result.addError('Something wrong with recover your password, try later', 'recoveryCode');
            return result;
        }
        result.status = resultStatus_1.ResultStatus.Success;
        return result;
    }
}
exports.AuthServices = AuthServices;
//# sourceMappingURL=authServices.js.map