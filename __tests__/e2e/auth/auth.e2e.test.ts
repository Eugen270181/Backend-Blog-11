import {RandomCodeServices} from "../../../src/common/adapters/randomCodeServices";
import {Request, Response, NextFunction} from "express";

const request = require("supertest");
//import request from "supertest";
import {initApp} from "../../../src/initApp";
import {appConfig} from "../../../src/common/settings/config";
import {db} from "../../../src/ioc";
import {testingDtosCreator} from "../testingDtosCreator";
import {routersPaths} from "../../../src/common/settings/paths";
import {ADMIN_LOGIN, ADMIN_PASS} from "../../../src/common/middleware/adminMiddleware";
import {getPostsQty} from "../posts/util/createGetPosts";
import {randomUUID, UUID} from "crypto";
import {User, UserDocument, userSchema} from "../../../src/features/users/domain/user.entity";
import {nodemailerServices} from "../../../src/common/adapters/nodemailerServices";
import {MongoMemoryServer} from "mongodb-memory-server";
import {OutputErrorsType} from "../../../src/common/types/outputErrors.type";
import {validateErrorsObject} from "../validateErrorsObject";
import {createUserBySa, getUsersQty} from "../users/utils/createGetUsers";
import {authRouteDoSAttack, createUserByReg} from "./utils/createGetAuth";
import { countHelper } from "../../../src/common/middleware/rateLimitLogger/rateLimitLoggerMiddleware";
import {Blog} from "../../../src/features/blogs/domain/blog.entity";


const originalSetRegConfirmationCode = User.prototype.setRegConfirmationCode;
const mockedSetRegConfirmationCode = jest.fn(function (
    code: string,
    date: Date
) {
    this.emailConfirmation = {
        confirmationCode: "123", // Ваш мок-код
        expirationDate: new Date("2024-01-01") // Ваша мок-дата
    };
});

describe(`<<AUTH>> ENDPOINTS TESTING!!!`, ()=>{

    const app=initApp()

    beforeAll(async () => {
        //const mongoServer = await MongoMemoryServer.create()
        //await db.run(mongoServer.getUri());
        await db.run(appConfig.MONGO_URI);
        await db.drop();
    })

    afterAll(async () => {
        await db.stop();
    })

    afterAll(done => {
        done()
    })

    const noValidRegUserDto = { login: '', email: 'hhh', password: 'hh' }
    const noValidEmailCodeDto = { email: 'hhh@mail.ru'}
    const noValidCodeDto = { code: randomUUID()}

    const recoveryRegCode = randomUUID();
    const resendRegCode = randomUUID();

    const spyRandomCode = jest.spyOn(RandomCodeServices,'genRandomCode')
    const spySendEmail = jest.spyOn(nodemailerServices,'sendEmail').mockResolvedValue(true)
    const spyRateLimit = jest.spyOn(countHelper,"rateCountFunction")



    let recoveryPassCode;
    let userBySa, userBySaDto, userDtos;

    describe(`POST -> "/auth/registration"`, ()=>{

        it(`POST -> "/auth/registration": Not valid registration Data. STATUS 400;`, async () => {
            userDtos = testingDtosCreator.createUserDtos(3)
            userBySa = await createUserBySa(app, userDtos[0]);

            const resPost = await request(app)
                .post(`${routersPaths.auth}/registration`)
                .send(noValidRegUserDto)
                .expect(400)
            const resPostBody:OutputErrorsType = resPost.body
            //проверка тела ответа на ошибки валидации входных данных по созданию юзера
            const expectedErrorsFields = ['login', 'email', 'password']
            validateErrorsObject(resPostBody, expectedErrorsFields)

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
            spyRandomCode.mockReturnValue(recoveryRegCode)
            //запрос на создание пользователя и кода для подтверждения регистрации - неактивного пользователя isConfirmed = false
            await request(app)
                .post(`${routersPaths.auth}/registration`)
                .send(userDtos[1])
                .expect(204)
            //запрос на получение юзеров, проверка на ошибочное создание невалидного юзера в БД
            const userCounter = await getUsersQty(app)
            expect(userCounter).toEqual(2)
            //aditional in DB
            const foundRegUserInDB: UserDocument = await  db.getModels().UserModel.findOne({ login: userDtos[1].login }).lean() as UserDocument
            expect(foundRegUserInDB?.emailConfirmation?.confirmationCode).toBe(recoveryRegCode)

        })

        it(`POST -> "/auth/registration": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
            await authRouteDoSAttack(app,`${routersPaths.auth}/registration`,1)

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

        it(`POST -> "/auth/registration-email-resending": Not valid registration Data. STATUS 400;`, async () => {
            await request(app)
                .post(`${routersPaths.auth}/registration-email-resending`)
                .send(noValidEmailCodeDto) //невалидный емайл
                .expect(400)

            await request(app)
                .post(`${routersPaths.auth}/registration-email-resending`)
                .send({email: userDtos[0].email}) //userBySa email - isConfirmed = true д.б. ошибка емайл юзера существует, но пользователь подтвержден
                .expect(400)

        })

        it(`POST -> "/auth/registration-email-resending": Everything ok. STATUS 204;`, async () => {
            spyRandomCode.mockReturnValue(resendRegCode)

            const resPost = await request(app)
                .post(`${routersPaths.auth}/registration-email-resending`)
                .send({email: userDtos[1].email})
                .expect(204)
            //aditional in DB
            const foundRegUserInDB: UserDocument = await  db.getModels().UserModel.findOne({ login: userDtos[1].login }).lean() as UserDocument
            expect(foundRegUserInDB?.emailConfirmation?.confirmationCode).toBe(resendRegCode)
        })

        it(`POST -> "/auth/registration-email-resending": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
            await authRouteDoSAttack(app,`${routersPaths.auth}/registration-email-resending`,1)

            await request(app)
                .post(`${routersPaths.auth}/registration-email-resending`)
                .send(noValidEmailCodeDto)
                .expect(400)

            await request(app)
                .post(`${routersPaths.auth}/registration-email-resending`)
                .send(noValidEmailCodeDto)
                .expect(429)
        })

    })

    describe(`POST -> "/auth/registration-confirmation"`, ()=>{

        it(`POST -> "/auth/registration-confirmation": Everything ok. STATUS 204;`, async () => {

            const resPost = await request(app)
                .post(`${routersPaths.auth}/registration-confirmation`)
                .send({ code: resendRegCode })
                .expect(204)
        })

        it(`POST -> "/auth/registration-confirmation": Not valid registration Data. STATUS 400;`, async () => {

            await request(app)
                .post(`${routersPaths.auth}/registration-confirmation`)
                .send(noValidCodeDto)
                .expect(400)

            await request(app)
                .post(`${routersPaths.auth}/registration-confirmation`)
                .send({ code: resendRegCode }) //email - isConfirmed = true  предыдущем it()
                .expect(400)

            //тест на протухший емайл код.../создаем пользователя и новый код подтверждения через регистрацию
            const newRegCode = randomUUID();
            spyRandomCode.mockReturnValue(newRegCode);
            spyRateLimit.mockReturnValue(false)

            await createUserByReg(app,userDtos[2]);
            spyRateLimit.mockRestore()
            User.prototype.setRegConfirmationCode = mockedSetRegConfirmationCode;

            await request(app)
                .post(`${routersPaths.auth}/registration-confirmation`)
                .send({ code: newRegCode }) //email - isConfirmed = true  предыдущем it()
                .expect(400)

            User.prototype.setRegConfirmationCode = originalSetRegConfirmationCode;

        })

        it(`POST -> "/auth/registration-confirmation": Rate limit reqests 5 in 10 sec. STATUS 429;`, async () => {
            await authRouteDoSAttack(app,`${routersPaths.auth}/registration-confirmation`,3)

            await request(app)
                .post(`${routersPaths.auth}/registration-confirmation`)
                .send(noValidCodeDto)
                .expect(400)

            await request(app)
                .post(`${routersPaths.auth}/registration-confirmation`)
                .send(noValidCodeDto)
                .expect(429)

            const blog = Blog.createBlogDocument({name:'sss', description:'sdsd',websiteUrl:'jkgjgj'})
        })


    })


})


