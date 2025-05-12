const request = require("supertest")
//import request from "supertest";
import {MongoMemoryServer} from "mongodb-memory-server";

import {OutputErrorsType} from "../../../src/common/types/outputErrors.type";
import {initApp} from "../../../src/initApp";
import {createUserBySa, getUsersQty} from "./utils/createGetUsers";
import {testingDtosCreator, UserDto} from "../testingDtosCreator";
import {db} from "../../../src/ioc";
import {ADMIN_LOGIN, ADMIN_PASS} from "../../../src/common/middleware/guardMiddlewares";
import {appConfig} from "../../../src/common/settings/config";
import {routersPaths} from "../../../src/common/settings/paths";
import {UserOutputModel} from "../../../src/features/users/types/output/userOutput.type";
import {validateErrorsObject} from "../validateErrorsObject";


describe(`<<USERS>> ENDPOINTS TESTING!!!`, () => {

    const app = initApp()

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

    const noValidUserDto = { login: '', email: 'hhh', password: 'hh' }

    let userDto: UserDto;
    let newUser: UserOutputModel;
    let newUserId: string;

    describe(`POST -> "/users":`, ()=>{

        it('shouldn`t create user with no valid data: STATUS 400', async () => {
            //запрос на создание нового юзера c невалидными данными
            const resPost = await request(app)
                .post(routersPaths.users)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(noValidUserDto)
                .expect(400);
            const resPostBody:OutputErrorsType = resPost.body
            //проверка тела ответа на ошибки валидации входных данных по созданию юзера
            const expectedErrorsFields = ['login', 'email', 'password']
            validateErrorsObject(resPostBody, expectedErrorsFields)
            //запрос на получение юзеров, проверка на ошибочное создание невалидного юзера в БД
            const userCounter = await getUsersQty(app)
            expect(userCounter).toEqual(0)
        });

        it('shouldn`t create user without authorization: STATUS 401', async () => {
            await request(app)
                .post(routersPaths.users)
                .send(noValidUserDto)
                .expect(401);
            //на всякий случай проверяем не произошло ли ошибочная запись в БД:
            const userCounter = await getUsersQty(app)
            expect(userCounter).toEqual(0)
        });

        it('should create user with correct data by sa and return it: STATUS 201', async () => {
            userDto = testingDtosCreator.createUserDto({})

            newUser = await createUserBySa(app, userDto);
            newUserId = newUser.id;

            expect(newUser).toEqual({
                id: expect.any(String),
                login: userDto.login,
                email: userDto.email,
                //createdAt: expect.any(String),
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?$/),
            });
            //на всякий случай проверяем не произошла ли ошибка записи в БД:
            const userCounter = await getUsersQty(app)
            expect(userCounter).toEqual(1)
        });

        it('shouldn`t create user twice with correct data by sa: STATUS 400', async () => {
            await request(app)
                .post(routersPaths.users)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(userDto)
                .expect(400);
            //на всякий случай проверяем не произошло ли ошибочная запись в БД:
            const userCounter = await getUsersQty(app)
            expect(userCounter).toEqual(1)
        });

    })

    describe(`GET -> "/users":`, () =>{

        it('shouldn`t get users without authorization: STATUS 401', async () => {
            await request(app)
                .get(routersPaths.users)
                .expect(401)
        });

        it(`should get users: Return pagination Object with users array keys - items. STATUS 200; add.: user created in prev test`, async () => {
            const resGet = await request(app)
                .get(routersPaths.users)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(200)
            expect(resGet.body).toEqual({
                pagesCount:	expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [newUser]
            })
        });

    })

    describe(`DELETE -> "/users":`, () =>{

        it('shouldn`t delete user by id without authorization: STATUS 401', async () => {
            await request(app)
                .delete(`${routersPaths.users}/${newUserId}`)
                .expect(401);
            //на всякий случай проверяем не произошло ли ошибочная запись в БД:
            const userCounter = await getUsersQty(app)
            expect(userCounter).toEqual(1)
        });

        it('shouldn`t delete user by id if specified user is not exists: STATUS 404', async () => {
            await request(app)
                .delete(`${routersPaths.users}/555`)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(404);
            //на всякий случай проверяем не произошло ли ошибочная запись в БД:
            const userCounter = await getUsersQty(app)
            expect(userCounter).toEqual(1)
        });

        it('should delete user by id: STATUS 204', async () => {
            await request(app)
                .delete(`${routersPaths.users}/${newUserId}`)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(204);
            //на всякий случай проверяем не произошло ли ошибочная запись в БД:
            const userCounter = await getUsersQty(app)
            expect(userCounter).toEqual(0)
        });

    })
})