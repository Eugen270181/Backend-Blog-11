import request from "supertest";

import {testingDtosCreator, UserDto} from "./testingDtosCreator";
import {routersPaths} from "../../../src/common/settings/paths";
import {ADMIN_LOGIN, ADMIN_PASS} from "../../../src/common/middleware/adminMiddleware";


export const createUser = async (app: any, userDto?: UserDto) => {

    const dto = userDto ?? testingDtosCreator.createUserDto({});

    const resp = await request(app).post(routersPaths.users).auth(ADMIN_LOGIN, ADMIN_PASS).send(dto).expect(201)

    return resp.body
}

export const createUsers = async (app: any, count: number) => {
    const users = [];

    for (let i = 0; i <= count; i++) {
        const resp = await request(app).post(routersPaths.users).auth(ADMIN_LOGIN, ADMIN_PASS).send({
            login: 'test' + i,
            email: `test${i}@gmail.com`,
            pass: '12345678'
        }).expect(201)

        users.push(resp.body)
    }
    return users;
}