import {appConfig} from "../../src/common/settings/config";

const request = require("supertest")
//import request from "supertest";
import {initApp} from "../../src/initApp";
import {MongoMemoryServer} from "mongodb-memory-server";

import {routersPaths} from "../../src/common/settings/paths";
import {ADMIN_LOGIN, ADMIN_PASS} from "../../src/common/middleware/adminMiddleware";
import {createUser} from "./utils/createUsers";
import {testingDtosCreator} from "./utils/testingDtosCreator";
import {db} from "../../src/ioc";




describe('USERS_TESTS', () => {
    const app = initApp()

    beforeAll(async () => {
        //const mongoServer = await MongoMemoryServer.create()
        //await db.run(mongoServer.getUri());
        await db.run(appConfig.MONGO_URI);
    })

    beforeEach(async () => {
        await db.drop();
    })

    afterAll(async () => {
        await db.stop();

    })

    afterAll(done => {
        done()
    })

    let userDto: any;

    it('shouldn`t create user without authorization: STATUS 401', async () => {
        await request(app)
            .post(routersPaths.users)
            .send({
                login: '',

            })
            .expect(401);
    });
    it('should create user with correct data by sa and return it: STATUS 201', async () => {
        userDto = testingDtosCreator.createUserDto({})

        const newUser = await request(app)
            .post(routersPaths.users)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userDto)
            .expect(201);

        expect(newUser.body).toEqual({
            id: expect.any(String),
            login: userDto.login,
            email: userDto.email,
            createdAt: expect.any(String),
            //createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?$/),
        });
    });
    it('shouldn`t create user twice with correct data by sa: STATUS 400', async () => {
        userDto = testingDtosCreator.createUserDto({})
        await createUser(app, userDto);

        await request(app)
            .post(routersPaths.users)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userDto)
            .expect(400);
    });
    it('shouldn`t create user with incorrect login: STATUS 400', async () => {
        userDto = testingDtosCreator.createUserDto({login: ''});
        await request(app)
            .post(routersPaths.users)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userDto)
            .expect(400);
    });
    it('shouldn`t create user with incorrect email: STATUS 400', async () => {
        userDto = testingDtosCreator.createUserDto({email: 'hhh'});
        await request(app)
            .post(routersPaths.users)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userDto)
            .expect(400);
    });
    it('shouldn`t create user with incorrect password: STATUS 400', async () => {
        userDto = testingDtosCreator.createUserDto({password: 'hh'});
        await request(app)
            .post(routersPaths.users)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .send(userDto)
            .expect(400);
    });
    it('shouldn`t deletePost user by id without authorization: STATUS 401', async () => {
        const user = await createUser(app);

        await request(app).delete(`${routersPaths.users + '/' + user.id}`).expect(401);
    });

    it('should deletePost user by id: STATUS 204', async () => {
        const user = await createUser(app);

        await request(app)
            .delete(`${routersPaths.users + '/' + user.id}`)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .expect(204);
    });

    it('shouldn`t deletePost user by id if specified user is not exists: STATUS 404', async () => {
        await request(app)
            .delete(`${routersPaths.users + '/555'}`)
            .auth(ADMIN_LOGIN, ADMIN_PASS)
            .expect(404);
    });
})