import {routersPaths} from "../../../../src/common/settings/paths";
import {
    LoginDto,
    passTestsDefault,
    RecoveryPassDto,
    testingDtosCreator,
    TokensDto,
    UserDto
} from "../../testingDtosCreator";
import {randomUUID, UUID} from "crypto";
import {codeServices} from "../../../../src/common/adapters/codeServices";
import {nodemailerServices} from "../../../../src/common/adapters/nodemailerServices";
import {UserOutputModel} from "../../../../src/features/users/types/output/userOutput.type";


const request = require("supertest");
//import request from 'supertest'

export const getArrTokensWithUsersLogin = async (app: any, users: UserOutputModel[]):Promise<TokensDto[]> => {
    let arrTokens:TokensDto[]=[]

    for (let i = 0; i < users.length; i++) {
        const tokens = await getTokensWithLogin(app,{ loginOrEmail: users[i].login, password: passTestsDefault })
        arrTokens.push(tokens)
    }

    return arrTokens
}

export const getArrTokensWithUserLogins = async (app: any, loginDto: LoginDto, count: number):Promise<TokensDto[]> => {
    let arrTokens:TokensDto[]=[]

    for (let i = 0; i < count; i++) {
        const tokens = await getTokensWithLogin(app, loginDto)
        arrTokens.push(tokens)
    }

    return arrTokens
}

export const getTokensWithLogin = async ( app: any, loginDto: LoginDto ): Promise<TokensDto> => {
    const resPost = await request(app)
        .post(`${routersPaths.auth}/login`)
        .send(loginDto)
        .expect(200);

    return getTokensInResponse(resPost)
};

export const getTokensWithRefreshToken = async ( app: any, refreshToken: String ): Promise<TokensDto> => {
    const resPost = await request(app)
        .post(`${routersPaths.auth}/refresh-token`)
        .set('Cookie',refreshToken)
        .expect(200);

    return getTokensInResponse(resPost)
};

const getTokensInResponse = (resPost:any): TokensDto => {
    // Проверка структуры accessToken в теле ответа
    expect(resPost.body).toEqual({
        accessToken: expect.any(String),
    });
    const AT: string = resPost.body.accessToken;

    // Проверка наличия cookies в заголовках
    const cookies = resPost.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(Array.isArray(cookies)).toBe(true);

    // Поиск конкретной куки refreshToken
    const RT = (cookies as string[]).find((cookie: string) =>
        cookie.startsWith('refreshToken=')
    );
    // Проверка что кука найдена
    expect(RT).toBeDefined();

    // Проверка формата куки
    const expectedPattern = /^refreshToken=eyJ[\w-]+\.[\w-]+\.[\w-]*; Path=\/; HttpOnly; Secure$/;
    expect(RT).toMatch(expectedPattern);

    return { accessToken: AT, refreshToken: RT! }
}

export const createUserByReg = async (app: any, userDto?: UserDto) => {

    const dto = userDto ?? testingDtosCreator.createUserDto({});

    await request(app).post(`${routersPaths.auth}/registration`).send(dto).expect(204)

}
export const logoutUser = async (app: any, refreshToken: String, expectedStatus:Number=204) => {

    await request(app)
        .post(`${routersPaths.auth}/logout`)
        .set('Cookie', refreshToken)
        .expect(expectedStatus);

}
export const recoveryPassByEmail = async (app: any, emailDto: RecoveryPassDto) => {

    await request(app).post(`${routersPaths.auth}/password-recovery`).send(emailDto).expect(204)

}

export const authRouteDoSAttack = async (app: any, routeAttack:string, reqCounter: number ) => {

    for (let i = 0; i < reqCounter; i++) {
        await request(app).post(routeAttack).send({})
    }
}

export const createUsersByReg = async (app: any, count: number):Promise<UUID[]> => {
    const usersCode: UUID[] = [];
    const userDtos: UserDto[] = testingDtosCreator.createUserDtos(count);

    const spyRandomCode = jest.spyOn(codeServices,'genRandomCode')
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