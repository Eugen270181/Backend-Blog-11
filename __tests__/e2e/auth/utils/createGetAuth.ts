import {routersPaths} from "../../../../src/common/settings/paths";
import {ADMIN_LOGIN, ADMIN_PASS} from "../../../../src/common/middleware/adminMiddleware";
import {testingDtosCreator, UserDto} from "../../testingDtosCreator";
import {UserOutputModel} from "../../../../src/features/users/types/output/userOutput.type";
import {randomUUID, UUID} from "crypto";
import {RandomCodeServices} from "../../../../src/common/adapters/randomCodeServices";
import {nodemailerServices} from "../../../../src/common/adapters/nodemailerServices";

const request = require("supertest");
//import request from 'supertest'


export const authRouteDoSAttack = async (app: any, routeAttack:string, reqCounter: number ) => {

    for (let i = 0; i < reqCounter; i++) {
        await request(app).post(routeAttack).send({})
    }
}

export const createUserByReg = async (app: any, userDto?: UserDto) => {

    const dto = userDto ?? testingDtosCreator.createUserDto({});

    await request(app).post(`${routersPaths.auth}/registration`).send(dto).expect(204)

}

export const createUsersByReg = async (app: any, count: number):Promise<UUID[]> => {
    const usersCode: UUID[] = [];
    const userDtos: UserDto[] = testingDtosCreator.createUserDtos(count);

    const spyRandomCode = jest.spyOn(RandomCodeServices,'genRandomCode')
    const spySendEmail = jest.spyOn(nodemailerServices,'sendEmail').mockResolvedValue(true)

    for (let i = 0; i < count; i++) {

        const regCode = randomUUID();
        spyRandomCode.mockReturnValue(regCode);
        await request(app).post(`${routersPaths.auth}/registration`).send(userDtos[i]).expect(204)
        usersCode.push(regCode)
    }

    spyRandomCode.mockRestore();
    spySendEmail.mockRestore();

    return usersCode;
}