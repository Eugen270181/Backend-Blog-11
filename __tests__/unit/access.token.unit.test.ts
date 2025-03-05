import {MongoMemoryServer} from "mongodb-memory-server";
import {authServices, db, usersRepository} from "../../src/ioc";
import {ResultStatus} from "../../src/common/types/enum/resultStatus";
import {jwtServices} from "../../src/common/adapters/jwtServices";


describe('UNIT', () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await db.run(mongoServer.getUri());
    })

    beforeEach(async () => {
        await db.drop();
    })

    afterAll(async () => {
        await db.drop();
        await db.stop();
    })

    afterAll((done) => done())
//TODO
    const checkAccessTokenUseCase = authServices.checkAccessToken
    it('should not verify noBearer auth', async () => {
        const result = await checkAccessTokenUseCase('Basic gbfbfbbhf')

        expect(result.status).toBe(ResultStatus.Unauthorized)

    })

    it('should not verify in jwtService', async () => {
        jwtServices.verifyToken = jest.fn().mockImplementation(async (token: string) => null)

        const result = await checkAccessTokenUseCase('Bearer gbfbfbbhf')

        expect(result.status).toBe(ResultStatus.Unauthorized)

    })

    it('should not verify in UsersRepository', async () => {
        jwtServices.verifyToken = jest.fn().mockImplementation(async (token: string) => {userId: '1'})

        usersRepository.findUserById = jest.fn().mockImplementation(async (userId: string) => null)

        const result = await checkAccessTokenUseCase('Bearer gbfbfbbhf')

        expect(result.status).toBe(ResultStatus.Unauthorized)

    })

    it('should verify access token', async () => {
        jwtServices.verifyToken = jest.fn().mockImplementation(async (token: string) => ({userId: '1'}))

        usersRepository.findUserById = jest.fn().mockImplementation(async (userId: string) => true)

        const result = await checkAccessTokenUseCase('Bearer gbfbfbbhf')

        expect(result.status).toBe(ResultStatus.Success)
    })

})