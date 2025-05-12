const request = require("supertest");
//import request from "supertest";
import {MongoMemoryServer} from "mongodb-memory-server";

import {initApp} from "../../../src/initApp";
import {appConfig} from "../../../src/common/settings/config";
import {db} from "../../../src/ioc";
import {
    ConfirmPassDto,
    ConfirmRegDto, LoginDto, passTestsDefault,
    RecoveryPassDto,
    RegistrationDto, ResendRegCodeDto,
    testingDtosCreator, TokensDto
} from "../testingDtosCreator";
import {routersPaths} from "../../../src/common/settings/paths";
import {randomUUID} from "crypto";
import {nodemailerServices} from "../../../src/common/adapters/nodemailerServices";
import {OutputErrorsType} from "../../../src/common/types/outputErrors.type";
import {validateErrorsObject} from "../validateErrorsObject";
import {createUserBySa, getUsersQty} from "../users/utils/createGetUsers";
import {
    authRouteDoSAttack,
    createUserByReg,
    getTokensWithLogin,
    getTokensWithRefreshToken, logoutUser,
    recoveryPassByEmail
} from "./utils/createGetAuth";
import {RequestsLogsRepository} from "../../../src/features/requestLogs/repositories/requestsLogsRepository";
import {RequestsLogsQueryRepository} from "../../../src/features/requestLogs/repositories/requestsLogsQueryRepository";
import {UserDocument} from "../../../src/features/users/domain/user.entity";
import {hashServices} from "../../../src/common/adapters/hashServices";

describe(`<<AUTH>> ENDPOINTS TESTING!!!`, ()=>{

    const app=initApp()

    beforeAll(async () => {
        spySendMail = jest.spyOn(nodemailerServices,'sendEmail').mockResolvedValue(true);//отключаем отправку писем
        //const mongoServer = await MongoMemoryServer.create()
        //await db.run(mongoServer.getUri());
        await db.run(appConfig.MONGO_URI);
        await db.drop();
    })

    beforeEach( async () => {
        jest.clearAllMocks()
        spyRateLimitDB = jest.spyOn(RequestsLogsRepository.prototype, "save").mockResolvedValue(false)
        spyRateLimitCounter = jest.spyOn(RequestsLogsQueryRepository.prototype, "requestsCounter").mockResolvedValue(0)
        spyUserModelSetRegDateCode = jest.spyOn(UserModel.prototype,"setRegConfirmationCode")
        //as SpyInstance<void, [string, Date]>
        spyUserModelSetPassDateCode = jest.spyOn(UserModel.prototype,"setPassConfirmationCode")
        //as SpyInstance<void, [string, Date]>
    })

    afterEach(async () => {
        spyRateLimitDB.mockRestore()
        spyRateLimitCounter.mockRestore()
        spyUserModelSetRegDateCode.mockRestore()
        spyUserModelSetPassDateCode.mockRestore()
    })

    afterAll(async () => {
        jest.restoreAllMocks();
        await db.stop();
    })

    afterAll(done => {
        done()
    })
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const UserModel = db.getModels().UserModel;

    const noValidRegUserDto: RegistrationDto = { login: '', email: 'hhh', password: 'hh' }
    const noValidLoginDto: LoginDto = { loginOrEmail: '', password: 'hh' }
    const noValidNewPassDto: ConfirmPassDto = { newPassword: "hh", recoveryCode: "hhhhh" }
    const noValidEmailDto1: ResendRegCodeDto = { email: 'mail.ru'}
    const noValidEmailDto2: RecoveryPassDto = { email: 'hhh@mail.ru'}
    const noFoundRegCodeDto: ConfirmRegDto = { code: randomUUID()}

    const recoveryPassCode1 = randomUUID();
    const recoveryPassCode2 = randomUUID();
    const recoveryRegCode = randomUUID();
    const resendRegCode = randomUUID();
    const newRegCode = randomUUID();

    let spySendMail, spyRateLimitDB, spyRateLimitCounter, spyUserModelSetRegDateCode, spyUserModelSetPassDateCode: jest.SpyInstance
    let tokens: TokensDto
    const setMockCodeDateRegConfirm = (code?:string, date?:Date) => {
        spyUserModelSetRegDateCode.mockImplementation(function (c:string, d:Date) {
            this.emailConfirmation = {
                confirmationCode: code??c,
                expirationDate: date??d,
            };
        });
    };
    const setMockCodeDatePassConfirm = (code?:string, date?:Date) => {
        spyUserModelSetPassDateCode.mockImplementation(function (c:string, d:Date) {
            this.passConfirmation = {
                confirmationCode: code??c,
                expirationDate: date??d,
            };
        });
    };

    const password = passTestsDefault
    const newPassword = passTestsDefault+'0'
    let userBySa, userDtos, userId;

    describe(`USER_REGISTRATION_RESENDING_CONFIRMATION:`, ()=>{

        describe(`POST -> "/auth/registration"`, ()=>{

            it(`POST -> "/auth/registration": Not valid registration Data. STATUS 400;`, async () => {
                //создаем 3 дтошки для будущих юзеров
                userDtos = testingDtosCreator.createUserDtos(3)
                //создаем первого юзера на основании перовой дтошки через суперадмина
                userBySa = await createUserBySa(app, userDtos[0]);

                //когда приходят невалидные данные - значения ключей дтошки
                const resPost = await request(app)
                    .post(`${routersPaths.auth}/registration`)
                    .send(noValidRegUserDto)
                    .expect(400)
                const resPostBody:OutputErrorsType = resPost.body
                //проверка тела ответа на ошибки валидации входных данных по созданию юзера
                const expectedErrorsFields = ['login', 'email', 'password']
                validateErrorsObject(resPostBody, expectedErrorsFields)

                //когда пытаемся зарегистрировать уже существующего первого пользователя еще раз
                const resPost2 = await request(app)
                    .post(`${routersPaths.auth}/registration`)
                    .send(userDtos[0])
                    .expect(400)
                const resPostBody2:OutputErrorsType = resPost2.body
                //проверка тела ответа на ошибки валидации входных данных по созданию юзера
                const expectedErrorsFields2 = ['login', 'email']
                validateErrorsObject(resPostBody2, expectedErrorsFields2)

                //запрос на получение юзеров, проверка на ошибочное создание невалидного юзера в БД
                const userCounter = await getUsersQty(app)
                expect(userCounter).toEqual(1)
            })

            it(`POST -> "/auth/registration": Everything ok. STATUS 204;`, async () => {
                setMockCodeDateRegConfirm(recoveryRegCode)
                //запрос на создание пользователя и кода для подтверждения регистрации - неактивного пользователя isConfirmed = false
                await request(app)
                    .post(`${routersPaths.auth}/registration`)
                    .send(userDtos[1])
                    .expect(204)
                //запрос на получение юзеров, проверка на ошибочное создание невалидного юзера в БД
                const userCounter = await getUsersQty(app)
                expect(userCounter).toEqual(2)
                //aditional in DB
                const foundRegUserInDB: UserDocument = await  UserModel.findOne({ login: userDtos[1].login }).lean() as UserDocument
                expect(foundRegUserInDB?.emailConfirmation?.confirmationCode).toBe(recoveryRegCode)
            })

            it(`POST -> "/auth/registration": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
                spyRateLimitDB.mockRestore()
                spyRateLimitCounter.mockRestore()
                await authRouteDoSAttack(app,`${routersPaths.auth}/registration`,4)

                await request(app)
                    .post(`${routersPaths.auth}/registration`)
                    .send(noValidRegUserDto)
                    .expect(400)

                await request(app)
                    .post(`${routersPaths.auth}/registration`)
                    .send(noValidRegUserDto)
                    .expect(429)
            })

        })

        describe(`POST -> "/auth/registration-email-resending"`, ()=>{

            it(`POST -> "/auth/registration-email-resending": Not valid Data. STATUS 400;`, async () => {
                await request(app)
                    .post(`${routersPaths.auth}/registration-email-resending`)
                    .send(noValidEmailDto2) //невалидный емайл - не существует в бд
                    .expect(400)

                await request(app)
                    .post(`${routersPaths.auth}/registration-email-resending`)
                    .send({email: userDtos[0].email}) //userBySa email - isConfirmed = true д.б. ошибка емайл юзера существует, но пользователь подтвержден
                    .expect(400)
            })

            it(`POST -> "/auth/registration-email-resending": Everything ok. STATUS 204;`, async () => {
                setMockCodeDateRegConfirm(resendRegCode)

                const resPost = await request(app)
                    .post(`${routersPaths.auth}/registration-email-resending`)
                    .send({email: userDtos[1].email})
                    .expect(204)
                //aditional in DB
                const foundRegUserInDB: UserDocument = await  UserModel.findOne({ login: userDtos[1].login }).lean() as UserDocument
                expect(foundRegUserInDB?.emailConfirmation?.confirmationCode).toBe(resendRegCode)
                userId = foundRegUserInDB._id.toString()
            })

            it(`POST -> "/auth/registration-email-resending": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
                spyRateLimitDB.mockRestore()
                spyRateLimitCounter.mockRestore()
                await authRouteDoSAttack(app,`${routersPaths.auth}/registration-email-resending`,4)

                await request(app)
                    .post(`${routersPaths.auth}/registration-email-resending`)
                    .send(noValidEmailDto2)
                    .expect(400)

                await request(app)
                    .post(`${routersPaths.auth}/registration-email-resending`)
                    .send(noValidEmailDto2)
                    .expect(429)
            })

        })

        describe(`POST -> "/auth/registration-confirmation"`, ()=>{

            it(`POST -> "/auth/registration-confirmation": Everything ok. STATUS 204;`, async () => {
                setMockCodeDateRegConfirm(resendRegCode)//подтверждаем регистрацию отправкой кода полученого при регистрации user1, и затем его переотправке

                const resPost = await request(app)
                    .post(`${routersPaths.auth}/registration-confirmation`)
                    .send({ code: resendRegCode })
                    .expect(204)
            })

            it(`POST -> "/auth/registration-confirmation": Not valid registration Data. STATUS 400;`, async () => {

                await request(app)
                    .post(`${routersPaths.auth}/registration-confirmation`)
                    .send({code:"123123"})  //просто невалидный код, не в формате UUID v.4
                    .expect(400)

                await request(app)
                    .post(`${routersPaths.auth}/registration-confirmation`)
                    .send(noFoundRegCodeDto)  //просто код не найденый в бд
                    .expect(400)

                await request(app)
                    .post(`${routersPaths.auth}/registration-confirmation`)
                    .send({ code: resendRegCode }) //код подтверждения существует, но пользователь подтвержден в предыдущ.тесте - isConfirmed = true
                    .expect(400)

                //тест на протухший емайл код.../создаем пользователя и новый код подтверждения через регистрацию
                setMockCodeDateRegConfirm(newRegCode, new Date("01-01-2000"))  //мокаем метод установки кода и даты подкидываем протухшую дату кода
                await createUserByReg(app,userDtos[2]); //создаем пользователя2 с протух.кодом регистрации
                //проверяем запросом
                await request(app)
                    .post(`${routersPaths.auth}/registration-confirmation`)
                    .send({ code: newRegCode }) //expirationDate - has expired
                    .expect(400)
            })

            it(`POST -> "/auth/registration-confirmation": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
                spyRateLimitDB.mockRestore()
                spyRateLimitCounter.mockRestore()
                await authRouteDoSAttack(app,`${routersPaths.auth}/registration-confirmation`,4)

                await request(app)
                    .post(`${routersPaths.auth}/registration-confirmation`)
                    .send(noFoundRegCodeDto)
                    .expect(400)

                await request(app)
                    .post(`${routersPaths.auth}/registration-confirmation`)
                    .send(noFoundRegCodeDto)
                    .expect(429)
            })

        })

    })

    describe(`USER_PASSWORD_RECOVERY_AND_CONFIRMATION:`, ()=>{

        describe(`POST -> "/auth/password-recovery"`,() => {

            it(`POST -> "/auth/password-recovery": Not valid Data. STATUS 400;`,async () => {
                const resPost = await request(app)
                    .post(`${routersPaths.auth}/password-recovery`)
                    .send(noValidEmailDto1)
                    .expect(400)
                const resPostBody:OutputErrorsType = resPost.body
                //проверка тела ответа на ошибки валидации входных данных по созданию юзера
                const expectedErrorsFields = ['email']
                validateErrorsObject(resPostBody, expectedErrorsFields)
            })

            it(`POST -> "/auth/password-recovery": Everything ok. STATUS 204;`,async () => {
                //первый кейс - пытаемся восстановить пароль для несуществующего емайл в бд, должны без отправки письма выдать статус 204
                await request(app)
                    .post(`${routersPaths.auth}/password-recovery`)
                    .send(noValidEmailDto2) //емайл - не существует в бд
                    .expect(204)
                expect(spySendMail).not.toHaveBeenCalled;//проверяем на случайную сработку ошибочной отправки кода на емайл входящий

                //второй кейс - стандарт отправка кода запись в юзера чей емайл пришел, - пользователь зарегеный
                // код - будет замокан(чтобы в эедпоинте подтверждения его подтвердить), дата протухания оригинальная
                setMockCodeDatePassConfirm(recoveryPassCode1)
                const resPost = await request(app)
                    .post(`${routersPaths.auth}/password-recovery`)
                    .send({email: userDtos[1].email})
                    .expect(204)
                //aditional in DB
                const foundRegUserInDB: UserDocument = await  UserModel.findOne({ login: userDtos[1].login }).lean() as UserDocument
                expect(foundRegUserInDB?.passConfirmation?.confirmationCode).toBe(recoveryPassCode1)

                //третий кейс - стандарт отправка кода запись в юзера чей емайл пришел, - пользователь незарегеный, по данной реализации тоже отпрваляется код на емайл
                setMockCodeDatePassConfirm(recoveryPassCode2)
                const resPost2 = await request(app)
                    .post(`${routersPaths.auth}/password-recovery`)
                    .send({email: userDtos[2].email})
                    .expect(204)
                //aditional in DB
                const foundRegUserInDB2: UserDocument = await  UserModel.findOne({ login: userDtos[2].login }).lean() as UserDocument
                expect(foundRegUserInDB2?.passConfirmation?.confirmationCode).toBe(recoveryPassCode2)

                expect(spySendMail).toHaveBeenCalledTimes(2);
            })

            it(`POST -> "/aut/password-recovery": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
                spyRateLimitDB.mockRestore()
                spyRateLimitCounter.mockRestore()
                await authRouteDoSAttack(app,`${routersPaths.auth}/password-recovery`,4)

                await request(app)
                    .post(`${routersPaths.auth}/password-recovery`)
                    .send(noValidEmailDto2) //емайл - не существует в бд
                    .expect(204)

                await request(app)
                    .post(`${routersPaths.auth}/password-recovery`)
                    .send(noValidEmailDto2) //емайл - не существует в бд
                    .expect(429)
            })

        })

        describe(`POST -> "/auth/new-password"`,() => {

            it(`POST -> "/auth/new-password": Not valid Data. STATUS 400;`,async () => {
                //первый кейс - пришла невалидная хрень и по коду и по паролю новому
                const resPost = await request(app)
                    .post(`${routersPaths.auth}/new-password`)
                    .send(noValidNewPassDto)
                    .expect(400)
                const resPostBody:OutputErrorsType = resPost.body
                //проверка тела ответа на ошибки валидации входных данных
                const expectedErrorsFields = ['newPassword', 'recoveryCode']
                validateErrorsObject(resPostBody, expectedErrorsFields)

                //второй кейс - код не найден
                const resPost2 = await request(app)
                    .post(`${routersPaths.auth}/new-password`)
                    .send({ newPassword: password, recoveryCode: randomUUID() } )
                    .expect(400)
                const resPostBody2:OutputErrorsType = resPost2.body
                //проверка тела ответа на ошибки валидации входных данных
                const expectedErrorsFields2 = ['recoveryCode']
                validateErrorsObject(resPostBody2, expectedErrorsFields2)

                //третий кейс - код восстановления протух //дополнительный запрос на создание кода и даты протухания - замоканые
                setMockCodeDatePassConfirm( recoveryPassCode2, new Date("01-01-2000") )
                await recoveryPassByEmail(app,{email:userDtos[2].email})

                const resPost3 = await request(app)
                    .post(`${routersPaths.auth}/new-password`)
                    .send({ newPassword: password, recoveryCode: recoveryPassCode2 } )
                    .expect(400)
                const resPostBody3:OutputErrorsType = resPost3.body
                //проверка тела ответа на ошибки валидации входных данных
                const expectedErrorsFields3 = ['recoveryCode']
                validateErrorsObject(resPostBody3, expectedErrorsFields3)
            })

            it(`POST -> "/auth/new-password": Everything ok. STATUS 204;`,async () => {
                //подтверждение
                await request(app)
                    .post(`${routersPaths.auth}/new-password`)
                    .send( { newPassword, recoveryCode: recoveryPassCode1 } )
                    .expect(204)

                //проверка нового хеша в бд на совместимость с новым паролем
                const foundUserInDB: UserDocument = await UserModel.findOne({ login: userDtos[1].login }).lean() as UserDocument
                expect(await hashServices.checkHash(newPassword, foundUserInDB?.passwordHash)).toBeTruthy()
            })

            it(`POST -> "/auth/new-password": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
                spyRateLimitDB.mockRestore()
                spyRateLimitCounter.mockRestore()
                await authRouteDoSAttack(app,`${routersPaths.auth}/new-password`,4)

                await request(app)
                    .post(`${routersPaths.auth}/new-password`)
                    .send(noValidNewPassDto) //емайл - не существует в бд
                    .expect(400)

                await request(app)
                    .post(`${routersPaths.auth}/new-password`)
                    .send(noValidNewPassDto) //емайл - не существует в бд
                    .expect(429)
            })

        })

    })

    describe(`USER_LOGIN_ABOUT_ME_REFRESH_TOKENS_AND_LOGOUT:`, ()=>{

        describe(`POST -> "/auth/login"`,() => {

            it(`POST -> "/auth/login": Not valid Data. STATUS 400;`,async () => {

                const resPost = await request(app)
                    .post(`${routersPaths.auth}/login`)
                    .send(noValidLoginDto)
                    .expect(400)
                const resPostBody:OutputErrorsType = resPost.body
                //проверка тела ответа на ошибки валидации входных данных по созданию юзера
                const expectedErrorsFields = ['loginOrEmail']
                validateErrorsObject(resPostBody, expectedErrorsFields)
            })

            it(`POST -> "/auth/login": No autorized(loginOrEmail or pass is wrong). STATUS 401;`, async () => {
                //loginOrEmail wrong
                await request(app)
                    .post(`${routersPaths.auth}/login`)
                    .send({ loginOrEmail: 'loginNotFound', password: 'hh' })
                    .expect(401)
                //pass wrong because pass user1 was recovered to '1234567'
                await request(app)
                    .post(`${routersPaths.auth}/login`)
                    .send({ loginOrEmail: userDtos[1].login, password: userDtos[1].password })
                    .expect(401)
            })

            it(`POST -> "/auth/login": Authorized. Everything ok. RT in cookie, AT in body. STATUS 200;`, async () => {
                //let take user1 credential - pass = (newPassword)
                const loginDto = { loginOrEmail: userDtos[1].login, password: newPassword }
                tokens = await getTokensWithLogin(app, loginDto)
            })

            it(`POST -> "/auth/login": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
                spyRateLimitDB.mockRestore()
                spyRateLimitCounter.mockRestore()
                await authRouteDoSAttack(app,`${routersPaths.auth}/login`,4)

                await request(app)
                    .post(`${routersPaths.auth}/login`)
                    .send(noValidLoginDto) //емайл - не существует в бд
                    .expect(400)

                await request(app)
                    .post(`${routersPaths.auth}/login`)
                    .send(noValidLoginDto) //емайл - не существует в бд
                    .expect(429)
            })

        })

        describe(`GET -> "/auth/me"`,() => {

            it(`POST -> "/auth/me": No autorized(loginOrEmail or pass is wrong). STATUS 401;`, async () => {
                await request(app)
                    .get(`${routersPaths.auth}/me`)
                    .expect(401)
            })

            it(`GET -> "/auth/me": With valid authorization. STATUS 200 + user data`, async () => {

                const res = await request(app)
                    .get(`${routersPaths.auth}/me`)
                    .set('Authorization', `Bearer ${tokens.accessToken}`)
                    .expect(200);

                // 3. Проверяем структуру ответа
                expect(res.body).toEqual({
                    email: userDtos[1].email,
                    login: userDtos[1].login,
                    userId
                });

            });

        })

        describe(`POST -> "/auth/refresh-token"`,() => {

            it(`POST -> "/auth/refresh-token": No refreshToken in requests cookies. STATUS 401;`, async () => {
                await request(app)
                    .post(`${routersPaths.auth}/refresh-token`)
                    .expect(401)
            })

            it(`POST -> "/auth/refresh-token": Authorized. Everything ok. RT in cookie(req/res), AT in body(res). STATUS 200;`, async () => {
                const oldTokens = {...tokens};
                await delay(1000);
                tokens = await getTokensWithRefreshToken(app, tokens.refreshToken)
                expect(oldTokens.refreshToken).not.toBe(tokens.refreshToken)
                await request(app)
                    .post(`${routersPaths.auth}/refresh-token`)
                    .set('Cookie', oldTokens.refreshToken)
                    .expect(401)
            })

        })

        describe(`POST -> "/auth/logout"`,() => {

            it(`POST -> "/auth/logout": No refreshToken in requests cookies. STATUS 401;`, async () => {

                await request(app)
                    .post(`${routersPaths.auth}/logout`)
                    .expect(401)

            })

            it(`POST -> "/auth/logout": Authorized. Everything ok. RT in cookie(req/res), AT in body(res). STATUS 200;`, async () => {

                await logoutUser(app, tokens.refreshToken)

                await logoutUser(app, tokens.refreshToken,401)

            })

        })

    })








})


