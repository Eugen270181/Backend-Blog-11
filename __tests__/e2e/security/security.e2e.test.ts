import {container} from "../../../src/composition-root";

const request = require("supertest");
//import request from "supertest";

import {initApp} from "../../../src/initApp";
import {routersPaths} from "../../../src/common/settings/paths";
import {appConfig} from "../../../src/common/settings/config";
import {passTestsDefault, TokensDto} from "../testingDtosCreator";
import {UserOutputModel} from "../../../src/features/users/types/output/userOutput.type";
import {createUsersBySa} from "../users/utils/createGetUsers";
import {getArrTokensWithUserLogins, getTokensWithLogin, logoutUser} from "../auth/utils/createGetAuth";
import {SecurityOutputModel} from "../../../src/features/security/types/output/securityOutput.model";
import {DB} from "../../../src/common/module/db/DB";



describe(`<<SECURITY>> ENDPOINTS TESTING!!!`, ()=>{

    const app=initApp()
    const db = container.get<DB>(DB)

    beforeAll(async () => {
        //const mongoServer = await MongoMemoryServer.create()
        //await db.run(mongoServer.getUri());
        await db.run(appConfig.MONGO_URI);
        await db.drop();
    })

    beforeEach( async () => {
        jest.clearAllMocks()
    })

    afterEach(async () => {

    })

    afterAll(async () => {
        jest.restoreAllMocks();
        await db.stop();
    })

    afterAll(done => {
        done()
    })


    let arrTokens: TokensDto[]=[];
    let users: UserOutputModel[];
    let devicesUser1, devicesUser0: SecurityOutputModel[];
    const password = passTestsDefault;

    describe(`GET -> "/security/devices"`, () =>{

        it(`GET -> "/security/devices". Valid RT auth. STATUS 200 + data(sessions array)`, async () => {
            let resGetDev1;

            //1. Создание 2 пользователей суперадмином через 2 дтошки автоматом
            users = await createUsersBySa(app,2)

            //2. Залогинивание 1 пользователя - 1 раз, 2-го - 3 раза с разных устройств
            arrTokens.push(await getTokensWithLogin(app,
                {loginOrEmail:users[0].login, password }
            ))
            arrTokens.push(...await getArrTokensWithUserLogins(
                app, {loginOrEmail:users[1].login, password },3) )

            //3а. Проверка через RT кол-ва сессий первого пользователя( = 1)
            const resGetDev0 = await request(app)
                .get(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[0].refreshToken)
                .expect(200);
            devicesUser0 = resGetDev0.body
            //проверка структуры ответа
            expect(devicesUser0).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    ip: expect.any(String),
                    title: expect.any(String),
                    lastActiveDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    deviceId: expect.any(String)
                })
            ]));
            expect(devicesUser0).toHaveLength(1);

            //3б. Проверка через RT кол-ва сессий второго пользователя( = 3)
            resGetDev1 = await request(app)
                .get(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[1].refreshToken)
                .expect(200);
            devicesUser1 = resGetDev1.body
            expect(devicesUser1).toHaveLength(3);
            //убираем сессию по RT из БД - arrTokens[3].refreshToken - делаем невалидный
            await logoutUser(app, arrTokens[3].refreshToken);
            //3в. Проверка через RT кол-ва сессий второго пользователя( = 2)
            resGetDev1 = await request(app)
                .get(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[1].refreshToken)
                .expect(200);
            expect(resGetDev1.body).toHaveLength(2);

        })

        it(`GET -> "/security/devices". Unauthorized with not Valid RT. STATUS 401`, async () => {
            //без токена
            await request(app)
                .get(`${routersPaths.security}/devices`)
                .expect(401);
            //с протухшим в пред.тесте - arrTokens[3].refreshToken
            await request(app)
                .get(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[3].refreshToken)
                .expect(401);

        })

    })

    describe(`DELETE -> "/security/devices/:id"`, () =>{

        it(`DELETE -> "/security/devices/:id". Unauthorized with not Valid RT. STATUS 401`, async () => {
            //без токена
            await request(app)
                .delete(`${routersPaths.security}/devices/1`)
                .expect(401);
            //с протухшим в пред.тесте - arrTokens[3].refreshToken
            await request(app)
                .delete(`${routersPaths.security}/devices/1`)
                .set('Cookie', arrTokens[3].refreshToken)
                .expect(401);

        })

        it(`DELETE -> "/security/devices/:id". Not Found deviceId. STATUS 404`, async () => {

            await request(app)
                .delete(`${routersPaths.security}/devices/${devicesUser1[2].deviceId}`)
                .set('Cookie', arrTokens[2].refreshToken)
                .expect(404);

        })

        it(`DELETE -> "/security/devices/:id". Forbidden. STATUS 403`, async () => {

            await request(app)
                .delete(`${routersPaths.security}/devices/${devicesUser1[1].deviceId}`)
                .set('Cookie', arrTokens[0].refreshToken)
                .expect(403);

        })

        it(`DELETE -> "/security/devices/:id". Everything OK. STATUS 204`, async () => {

            //удаляем
            await request(app)
                .delete(`${routersPaths.security}/devices/${devicesUser1[1].deviceId}`)
                .set('Cookie', arrTokens[1].refreshToken)
                .expect(204);

            //добавляем
            arrTokens.push(await getTokensWithLogin(app,
                {loginOrEmail:users[1].login, password }
            ))
            //3в. Проверка через RT кол-ва сессий второго пользователя( = 2)
            const resGet = await request(app)
                .get(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[1].refreshToken)
                .expect(200);
            expect(resGet.body).toHaveLength(2);

        })

    })

    describe(`DELETE -> "/security/devices"`, () =>{

        it(`DELETE -> "/security/devices". Unauthorized with not Valid RT. STATUS 401`, async () => {
            //без токена
            await request(app)
                .delete(`${routersPaths.security}/devices`)
                .expect(401);
            //с протухшим в пред.тесте - arrTokens[3].refreshToken
            await request(app)
                .delete(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[3].refreshToken)
                .expect(401);

        })

        it(`DELETE -> "/security/devices". Everything OK. STATUS 204`, async () => {

            const resGet = await request(app)
                .get(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[1].refreshToken)
                .expect(200);
            expect(resGet.body).toHaveLength(2);

            await request(app)
                .delete(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[1].refreshToken)
                .expect(204);

            //3в. Проверка через RT кол-ва сессий второго пользователя( = 2)
            const resGet2 = await request(app)
                .get(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[1].refreshToken)
                .expect(200);
            expect(resGet2.body).toHaveLength(1);

            ///////////////////////////////////////////
            const resGet3 = await request(app)
                .get(`${routersPaths.security}/devices`)
                .set('Cookie', arrTokens[0].refreshToken)
                .expect(200);
            expect(resGet3.body).toHaveLength(1);

        })

    })

})