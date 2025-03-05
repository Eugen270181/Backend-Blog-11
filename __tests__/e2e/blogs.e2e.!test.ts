import {req} from './helpers/test-helpers'
import {dbMongo, setDB} from '../src/db/dbMemory'
import {appConfig} from '../src/common/settings/config'
import {codedAuth, createString, dataset1} from './helpers/datasets'
import {CreateBlogInputModel} from "../src/features/blogs/types/input/createBlogInput.model";

describe('/blogs', () => {
    // beforeAll(async () => { // очистка базы данных перед началом тестирования
    //     setDB()
    // })

    it('should create', async () => {
        setDB()
        const newBlog: CreateBlogInputModel = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'http://some.com',
        }

        const res = await req
            .post(appConfig.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(201)

        // console.log(res.body)

        expect(res.body.name).toEqual(newBlog.name)
        expect(res.body.description).toEqual(newBlog.description)
        expect(res.body.websiteUrl).toEqual(newBlog.websiteUrl)
        expect(typeof res.body.id).toEqual('string')

        expect(res.body).toEqual(dbMongo.blogs[0])
    })
    it('shouldn\'t create 401', async () => {
        setDB()
        const newBlog: CreateBlogInputModel = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'http://some.com',
        }

        const res = await req
            .post(appConfig.PATH.BLOGS)
            .send(newBlog) // отправка данных
            .expect(401)

        // console.log(res.body)

        expect(dbMongo.blogs.length).toEqual(0)
    })
    it('shouldn\'t create', async () => {
        setDB()
        const newBlog: CreateBlogInputModel = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .post(appConfig.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(400)

        // console.log(res.body)

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('name')
        expect(res.body.errorsMessages[1].field).toEqual('description')
        expect(res.body.errorsMessages[2].field).toEqual('websiteUrl')

        expect(dbMongo.blogs.length).toEqual(0)
    })
    it('should get empty array', async () => {
        setDB() // очистка базы данных если нужно

        const res = await req
            .get(appConfig.PATH.BLOGS)
            .expect(200) // проверяем наличие эндпоинта

        // console.log(res.body) // можно посмотреть ответ эндпоинта

        expect(res.body.length).toEqual(0) // проверяем ответ эндпоинта
    })
    it('should get not empty array', async () => {
        setDB(dataset1) // заполнение базы данных начальными данными если нужно

        const res = await req
            .get(appConfig.PATH.BLOGS)
            .expect(200)

        // console.log(res.body)

        expect(res.body.length).toEqual(1)
        expect(res.body[0]).toEqual(dataset1.blogs[0])
    })
    it('shouldn\'t find', async () => {
        setDB(dataset1)

        const res = await req
            .get(appConfig.PATH.BLOGS + '/1')
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('should find', async () => {
        setDB(dataset1)

        const res = await req
            .get(appConfig.PATH.BLOGS + '/' + dataset1.blogs[0].id)
            .expect(200) // проверка на ошибку

        // console.log(res.body)

        expect(res.body).toEqual(dataset1.blogs[0])
    })
    it('should del', async () => {
        setDB(dataset1)

        const res = await req
            .delete(appConfig.PATH.BLOGS + '/' + dataset1.blogs[0].id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204) // проверка на ошибку

        // console.log(res.body)

        expect(dbMongo.blogs.length).toEqual(0)
    })
    it('shouldn\'t del', async () => {
        setDB()

        const res = await req
            .delete(appConfig.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('shouldn\'t del 401', async () => {
        setDB()

        const res = await req
            .delete(appConfig.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic' + codedAuth}) // no ' '
            .expect(401) // проверка на ошибку

        // console.log(res.body)
    })
    it('should update', async () => {
        setDB(dataset1)
        const blog: CreateBlogInputModel = {
            name: 'n2',
            description: 'd2',
            websiteUrl: 'http://some2.com',
        }

        const res = await req
            .put(appConfig.PATH.BLOGS + '/' + dataset1.blogs[0].id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blog)
            .expect(204) // проверка на ошибку

        // console.log(res.body)

        expect(dbMongo.blogs[0]).toEqual({...dbMongo.blogs[0], ...blog})
    })
    it('shouldn\'t update 404', async () => {
        setDB()
        const blog: CreateBlogInputModel = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'http://some.com',
        }

        const res = await req
            .put(appConfig.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blog)
            .expect(404) // проверка на ошибку

        // console.log(res.body)
    })
    it('shouldn\'t update2', async () => {
        setDB(dataset1)
        const blog: CreateBlogInputModel = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .put(appConfig.PATH.BLOGS + '/' + dataset1.blogs[0].id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blog)
            .expect(400) // проверка на ошибку

        // console.log(res.body)

        expect(dbMongo).toEqual(dataset1)
        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('name')
        expect(res.body.errorsMessages[1].field).toEqual('description')
        expect(res.body.errorsMessages[2].field).toEqual('websiteUrl')
    })
    it('shouldn\'t update 401', async () => {
        setDB(dataset1)
        const blog: CreateBlogInputModel = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .put(appConfig.PATH.BLOGS + '/' + dataset1.blogs[0].id)
            .set({'Authorization': 'Basic ' + codedAuth + 'error'})
            .send(blog)
            .expect(401) // проверка на ошибку

        // console.log(res.body)

        expect(dbMongo).toEqual(dataset1)
    })
})