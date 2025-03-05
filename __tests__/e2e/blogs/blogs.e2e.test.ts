import request from "supertest";
import {initApp} from "../../../src/initApp";
import {routersPaths} from "../../../src/common/settings/paths";
import {ADMIN_LOGIN, ADMIN_PASS} from "../../../src/common/middleware/adminMiddleware";
import {appConfig} from "../../../src/common/settings/config";
import {CreateBlogInputModel} from "../../../src/features/blogs/types/input/createBlogInput.model";
import {BlogOutputModel} from "../../../src/features/blogs/types/output/blogOutput.model";
import {createString} from "../utils/datasets";
import {OutputErrorsType} from "../../../src/common/types/outputErrors.type";
import {UpdateBlogInputModel} from "../../../src/features/blogs/types/input/updateblogInput.model";
import {db} from "../../../src/ioc";
//import {MongoMemoryServer} from "mongodb-memory-server";

describe(`<<BLOGS>> ENDPOINTS TESTING!!!`, ()=>{

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

    let newBlogOutputObj:BlogOutputModel;
    let updatedBlogOutputObj:BlogOutputModel;
    let newBlogId:string;

    describe(`POST -> "/blogs", GET -> "/blogs", "/blogs/:id"`, ()=>{

        it(`POST -> "/blogs": Can't create blog without authorization: STATUS 401; used additional methods: GET -> /blogs`, async () => {
            const newBlog: CreateBlogInputModel = {
                name: 'n1',
                description: 'd1',
                websiteUrl: 'http://some.com',
            }
            //запрос на создание нового блога без авторизации
            await request(app)
                .post(routersPaths.blogs)
                .send(newBlog)
                .expect(401);
            //запрос на получение блогов, проверка на ошибочное создание блога в БД
            const resGet = await request(app)
                .get(routersPaths.blogs)
                .expect(200)
            expect(resGet.body.items.length).toEqual(0)
        } );

        it(`POST -> "/blogs": Can't create blog with not valid data: STATUS 400; Should return errors if passed body is incorrect;`, async () => {
            const newBlog: CreateBlogInputModel = {
                name: createString(16),
                description: createString(501),
                websiteUrl: createString(101),
            }
            //запрос на создание нового блога c невалидными данными
            const resPost = await request(app)
                .post(routersPaths.blogs)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(newBlog) // отправка данных
                .expect(400)
            const resPostBody:OutputErrorsType = resPost.body
            //проверка тела ответа на ошибки валидации входных данных по созданию блога
            expect(resPostBody.errorsMessages.length).toEqual(3)
            expect(resPostBody.errorsMessages[0].field).toEqual('name')
            expect(resPostBody.errorsMessages[1].field).toEqual('description')
            expect(resPostBody.errorsMessages[2].field).toEqual('websiteUrl')
            //запрос на получение блогов, проверка на ошибочное создание блога в БД
            const resGet = await request(app)
                .get(routersPaths.blogs)
                .expect(200)
            expect(resGet.body.items.length).toEqual(0)
        })

        it(`POST -> "/blogs": Create new blog; STATUS 201; content: created blog; used additional methods: GET -> /blogs/:id`, async () => {
            const createBlogInputObj: CreateBlogInputModel = {
                name: 'n1',
                description: 'd1',
                websiteUrl: 'http://some.com',
            }
            //запрос на создание нового блога
            const resPost = await request(app)
                .post(routersPaths.blogs)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(createBlogInputObj) // отправка данных
                .expect(201)
            //проверка тела ответа на запрос по созданию блога
            newBlogOutputObj = resPost.body
            newBlogId = newBlogOutputObj.id
            //проверка соответствия схемы представления ответа по полям модели ответа, и значений полученых
            expect(newBlogOutputObj).toEqual({
                id: expect.any(String),
                ...createBlogInputObj,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?$/),
                isMembership: expect.any(Boolean)
            });
            //запрос на получение созданного блога по Id - проверка создания в БД нового блога
            const resGetId = await request(app)
                .get(routersPaths.blogs+'/'+newBlogOutputObj.id)
                .expect(200)
            expect(resGetId.body).toEqual(newBlogOutputObj)
        })

        it(`GET -> "/blogs": Return pagination Object with blogs array keys - items. STATUS 200; add.: blog created in prev test`, async () => {
            //запрос на получение блогов - проверка создания в БД нового блога
            const resGet = await request(app)
                .get(routersPaths.blogs)
                .expect(200)
            expect(resGet.body).toEqual({
                pagesCount:	expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [newBlogOutputObj]
            })
        })

        it(`GET -> "/blogs/:id": Can't found with id. STATUS 404;`, async () => {
            await request(app)
                .get(routersPaths.blogs+'/1')
                .expect(404)
        })
    })

    describe(`PUT -> "/blogs/:id"`, ()=>{

        it(`PUT -> "/blogs/:id": Can't update blog without authorization: STATUS 401; used additional methods: GET -> /blogs`, async () => {
            const updateBlogInputObj: UpdateBlogInputModel = {
                name: 'n1-edit',
                description: 'd1-edit',
                websiteUrl: 'http://some.com/edit',
            }
            //запрос на обонвление существующего блога по id без авторизации
            await request(app)
                .put(routersPaths.blogs+"/" + newBlogId)
                .send(updateBlogInputObj)
                .expect(401)
            //запрос на получение блога по id, проверка на ошибочное обновление блога в БД
            const resGetId = await request(app)
                .get(routersPaths.blogs+'/'+newBlogId)
                .expect(200)
            expect(resGetId.body).toEqual(newBlogOutputObj)
        })

        it(`PUT -> "/blogs/:id": Can't update blog with not valid data: STATUS 400; Should return errors if passed body is incorrect;`, async () => {
            const updateBlogInputObj: UpdateBlogInputModel = {
                name: createString(16),
                description: createString(501),
                websiteUrl: createString(101),
            }
            //запрос на обонвление существующего блога по id с невалидными данными
            const resPut = await request(app)
                .put(routersPaths.blogs+"/" + newBlogId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(updateBlogInputObj)
                .expect(400)
            const resPutBody:OutputErrorsType = resPut.body
            //проверка тела ответа на ошибки валидации входных данных по созданию блога
            expect(resPutBody.errorsMessages.length).toEqual(3)
            expect(resPutBody.errorsMessages[0].field).toEqual('name')
            expect(resPutBody.errorsMessages[1].field).toEqual('description')
            expect(resPutBody.errorsMessages[2].field).toEqual('websiteUrl')
            //запрос на получение блога по id, проверка на ошибочное обновление блога в БД
            const resGetId = await request(app)
                .get(routersPaths.blogs+'/'+newBlogId)
                .expect(200)
            expect(resGetId.body).toEqual(newBlogOutputObj)
        })

        it(`PUT -> "/blogs/:id": Can't found with id. STATUS 404; used additional methods: GET -> /blogs/:id`, async () => {
            const updateBlogInputObj: UpdateBlogInputModel = {
                name: 'n1-edit',
                description: 'd1-edit',
                websiteUrl: 'http://some.com/edit',
            }
            //запрос на обонвление блога по неверному/несуществующему id
            await request(app)
                .put(routersPaths.blogs+'/1')
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(updateBlogInputObj)
                .expect(404)
            //запрос на получение блога по id, проверка на ошибочное обновление блога в БД
            const resGetId = await request(app)
                .get(routersPaths.blogs+'/'+newBlogId)
                .expect(200)
            expect(resGetId.body).toEqual(newBlogOutputObj)
        })

        it(`PUT -> "/blogs/:id": Updatete new blog; STATUS 204; no content; used additional methods: GET -> /blogs/:id`, async () => {
            const updateBlogInputObj: UpdateBlogInputModel = {
                name: 'n1-edit',
                description: 'd1-edit',
                websiteUrl: 'http://some.com/edit',
            }
            //запрос на обонвление существующего блога по id
            await request(app)
                .put(routersPaths.blogs+"/" + newBlogId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(updateBlogInputObj)
                .expect(204)
            //запрос на получение обновленного блога по Id - проверка операции обновления нового блога в БД
            const resGetId = await request(app)
                .get(routersPaths.blogs+'/'+newBlogId)
                .expect(200)
            updatedBlogOutputObj = {...newBlogOutputObj, ...updateBlogInputObj}
            expect(resGetId.body).toEqual(updatedBlogOutputObj)

        })
    })

    describe(`DELETE -> "/blogs/:id"`, ()=>{

        it(`DELETE -> "/blogs/:id": Can't delete blog without authorization: STATUS 401; used additional methods: GET -> /blogs`, async () => {
            //запрос на удаление существующего блога по id без авторизации
            await request(app)
                .delete(routersPaths.blogs+"/" + newBlogId)
                .expect(401)
            //запрос на получение блогов, проверка на ошибочное удаление блога в БД
            const resGet = await request(app)
                .get(routersPaths.blogs)
                .expect(200)
            expect(resGet.body.items.length).not.toEqual(0)
        })

        it(`DELETE -> "/blogs/:id": Can't found with id. STATUS 404; used additional methods: GET -> /blogs`, async () => {
            //запрос на удаление блога по неверному/несуществующему id
            await request(app)
                .delete(routersPaths.blogs+'/1')
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(404)
            //запрос на получение блогов, проверка на ошибочное удаление блога в БД
            const resGet = await request(app)
                .get(routersPaths.blogs)
                .expect(200)
            expect(resGet.body.items.length).not.toEqual(0)
        })

        it(`DELETE -> "/blogs/:id": Delete updated blog; STATUS 204; no content; used additional methods: GET -> /blogs`, async () => {
            //запрос на обонвление существующего блога по id
            await request(app)
                .delete(routersPaths.blogs+"/" + newBlogId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(204)
            //запрос на получение блогов, проверка на удаление блога в БД
            const resGet = await request(app)
                .get(routersPaths.blogs)
                .expect(200)
            expect(resGet.body.items.length).toEqual(0)
        })

    })


})