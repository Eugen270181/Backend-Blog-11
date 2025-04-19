const request = require("supertest")
//import request from "supertest";
import {testingDtosCreator, UserDto} from "../../testingDtosCreator";

import {ADMIN_LOGIN, ADMIN_PASS} from "../../../../src/common/middleware/adminMiddleware";
import {routersPaths} from "../../../../src/common/settings/paths";
import {UserOutputModel} from "../../../../src/features/users/types/output/userOutput.type";




export const createUserBySa = async (app: any, userDto?: UserDto):Promise<UserOutputModel> => {

    const dto = userDto ?? testingDtosCreator.createUserDto({});

    const resp = await request(app).post(routersPaths.users).auth(ADMIN_LOGIN, ADMIN_PASS).send(dto).expect(201)

    return resp.body
}

export const getUsersQty = async (app: any):Promise<Number> => {

    const resp = await request(app).get(routersPaths.users).auth(ADMIN_LOGIN, ADMIN_PASS).expect(200)

    return resp.body.totalCount
}

export const createUsersBySa = async (app: any, count: number):Promise<UserOutputModel[]> => {
    const users: UserOutputModel[] = [];
    const userDtos: UserDto[] = testingDtosCreator.createUserDtos(count);

    for (let i = 0; i < count; i++) {
        const resp = await request(app).post(routersPaths.users).auth(ADMIN_LOGIN, ADMIN_PASS).send(userDtos[i]).expect(201)
        users.push(resp.body)
    }
    return users;
}

