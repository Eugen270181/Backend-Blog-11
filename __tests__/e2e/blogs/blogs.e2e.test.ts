import {ADMIN_LOGIN, ADMIN_PASS} from "../../../src/common/middleware/guardMiddlewares";

const request = require("supertest");
//import request from "supertest";
import {initApp} from "../../../src/initApp";
import {routersPaths} from "../../../src/common/settings/paths";
import {appConfig} from "../../../src/common/settings/config";
import {BlogOutputModel} from "../../../src/features/blogs/types/output/blogOutput.model";
import {OutputErrorsType} from "../../../src/common/types/outputErrors.type";
import {db} from "../../../src/ioc";
import {BlogDto, createString, testingDtosCreator} from "../testingDtosCreator";
import {createBlog, getBlogById, getBlogs, getBlogsQty} from "./utils/createGetBlogs";
import {validateErrorsObject} from "../validateErrorsObject";


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

    afterAll(done => {
        done()
    })

    const noValidBlogDto = {
        name: createString(16),
        description: createString(501),
        websiteUrl: createString(101),
    }

    let blogDtos: BlogDto[];
    let newBlog: BlogOutputModel;
    let updatedBlog: BlogOutputModel;
    let newBlogId: string;

    describe(`POST -> "/blogs":`, ()=>{

        it(`POST -> "/blogs": Can't create blog with not valid data: STATUS 400; Should return errors if passed body is incorrect;`, async () => {
            //запрос на создание нового блога c невалидными данными
            const resPost = await request(app)
                .post(routersPaths.blogs)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(noValidBlogDto) // отправка данных
                .expect(400)
            const resPostBody:OutputErrorsType = resPost.body
            //проверка тела ответа на ошибки валидации входных данных по созданию блога
            const expectedErrorsFields = ['name', 'description', 'websiteUrl']
            validateErrorsObject(resPostBody, expectedErrorsFields)
            //запрос на получение блогов, проверка на ошибочное создание блога в БД
            const blogCounter = await getBlogsQty(app)
            expect(blogCounter).toEqual(0)
        })

        it(`POST -> "/blogs": Can't create blog without authorization: STATUS 401; used additional methods: GET -> /blogs`, async () => {
            //запрос на создание нового блога без авторизации
            await request(app)
                .post(routersPaths.blogs)
                .send(noValidBlogDto)
                .expect(401);
            //запрос на получение блогов, проверка на ошибочное создание блога в БД
            const blogCounter = await getBlogsQty(app)
            expect(blogCounter).toEqual(0)
        } );

        it(`POST -> "/blogs": Create new blog; STATUS 201; content: created blog`, async () => {
            blogDtos = testingDtosCreator.createBlogDtos(2)
            //запрос на создание нового блога
            newBlog = await createBlog(app,blogDtos[0])
            //проверка тела ответа на запрос по созданию блога
            newBlogId = newBlog.id
            //проверка соответствия схемы представления ответа по полям модели ответа, и значений полученых
            expect(newBlog).toEqual({
                id: expect.any(String),
                ...blogDtos[0],
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?$/),
                isMembership: expect.any(Boolean)
            });
            //на всякий случай проверяем не произошла ли ошибка записи в БД:
            const blogCounter = await getBlogsQty(app)
            expect(blogCounter).toEqual(1)
            //запрос на получение созданного блога по Id - проверка создания в БД нового блога
            const foundBlog = await getBlogById(app, newBlogId)
            expect(foundBlog).toEqual(newBlog)
        })

    })

    describe(`GET -> "/blogs":`, () =>{

        it(`GET -> "/blogs": Return pagination Object with blogs array keys - items. STATUS 200; add.: blog created in prev test`, async () => {
            //запрос на получение блогов - проверка создания в БД нового блога
            const foundBlogs = await getBlogs(app)
            expect(foundBlogs).toEqual({
                pagesCount:	expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [newBlog]
            })
        })

    })

    describe(`GET -> "/blogs/:id":`, () =>{

        it(`GET -> "/blogs/:id": Can't found with id. STATUS 404;`, async () => {
            await request(app)
                .get(routersPaths.blogs+'/1')
                .expect(404)
        })

    })

    describe(`PUT -> "/blogs/:id"`, ()=>{

        it(`PUT -> "/blogs/:id": Can't update blog with not valid data: STATUS 400; Should return errors if passed body is incorrect;`, async () => {
            //запрос на обонвление существующего блога по id с невалидными данными
            const resPut = await request(app)
                .put(routersPaths.blogs+"/" + newBlogId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(noValidBlogDto)
                .expect(400)
            const resPutBody:OutputErrorsType = resPut.body
            //проверка тела ответа на ошибки валидации входных данных по созданию блога
            const expectedErrorsFields = ['name', 'description', 'websiteUrl']
            validateErrorsObject(resPutBody, expectedErrorsFields)
            //запрос на получение блога по id, проверка на ошибочное обновление блога в БД
            const foundBlog = await getBlogById(app, newBlogId)
            expect(foundBlog).toEqual(newBlog)
        })

        it(`PUT -> "/blogs/:id": Can't update blog without authorization: STATUS 401; used additional methods: GET -> /blogs`, async () => {
            //запрос на обонвление существующего блога по id без авторизации
            await request(app)
                .put(routersPaths.blogs + "/" + newBlogId)
                .send(noValidBlogDto)
                .expect(401)
            //запрос на получение блога по id, проверка на ошибочное обновление блога в БД
            const foundBlog = await getBlogById(app, newBlogId)
            expect(foundBlog).toEqual(newBlog)
        })

        it(`PUT -> "/blogs/:id": Can't found with id. STATUS 404; used additional methods: GET -> /blogs/:id`, async () => {
            //запрос на обонвление блога по неверному/несуществующему id
            await request(app)
                .put(routersPaths.blogs+'/1')
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(blogDtos[1])
                .expect(404)
            //запрос на получение блога по id, проверка на ошибочное обновление блога в БД
            const foundBlog = await getBlogById(app, newBlogId)
            expect(foundBlog).toEqual(newBlog)
        })

        it(`PUT -> "/blogs/:id": Updatete new blog; STATUS 204; no content; used additional methods: GET -> /blogs/:id`, async () => {
            //запрос на обонвление существующего блога по id
            await request(app)
                .put(routersPaths.blogs+"/" + newBlogId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(blogDtos[1])
                .expect(204)
            //запрос на получение обновленного блога по Id - проверка операции обновления нового блога в БД
            const foundBlog = await getBlogById(app, newBlogId)
            updatedBlog = {...newBlog, ...blogDtos[1]}
            expect(foundBlog).toEqual(updatedBlog)
        })
    })

    describe(`DELETE -> "/blogs/:id"`, ()=>{

        it(`DELETE -> "/blogs/:id": Can't delete blog without authorization: STATUS 401; used additional methods: GET -> /blogs`, async () => {
            //запрос на удаление существующего блога по id без авторизации
            await request(app)
                .delete(routersPaths.blogs+"/" + newBlogId)
                .expect(401)
            //запрос на получение блогов, проверка на ошибочное удаление блога в БД
            const blogCounter = await getBlogsQty(app)
            expect(blogCounter).toEqual(1)
        })

        it(`DELETE -> "/blogs/:id": Can't found with id. STATUS 404; used additional methods: GET -> /blogs`, async () => {
            //запрос на удаление блога по неверному/несуществующему id
            await request(app)
                .delete(routersPaths.blogs+'/1')
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(404)
            //запрос на получение блогов, проверка на ошибочное удаление блога в БД
            const blogCounter = await getBlogsQty(app)
            expect(blogCounter).toEqual(1)
        })

        it(`DELETE -> "/blogs/:id": Delete updated blog; STATUS 204; no content; used additional methods: GET -> /blogs`, async () => {
            //запрос на удаление существующего блога по id
            await request(app)
                .delete(routersPaths.blogs+"/" + newBlogId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(204)
            //запрос на получение блогов, проверка на удаление блога в БД
            const blogCounter = await getBlogsQty(app)
            expect(blogCounter).toEqual(0)
        })

    })

})