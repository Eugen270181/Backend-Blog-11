import {MongoMemoryServer} from "mongodb-memory-server";
import {ResultStatus} from "../../src/common/types/enum/resultStatus";
import {jwtServices} from "../../src/common/adapters/jwtServices";
import {container} from "../../src/composition-root";
import {DB} from "../../src/common/module/db/DB";
import {TYPES} from "../../src/ioc-types";
import {AuthServices} from "../../src/features/auth/services/authServices";
import {UsersRepository} from "../../src/features/users/repositories/usersRepository";

const authServices = container.get<AuthServices>(TYPES.AuthServices)
const usersRepository = container.get<UsersRepository>(TYPES.UsersRepository)

describe('UNIT', () => {

    const db = container.get<DB>(DB)

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