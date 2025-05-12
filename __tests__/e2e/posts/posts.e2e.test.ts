import {ADMIN_LOGIN, ADMIN_PASS} from "../../../src/common/middleware/guardMiddlewares";

const request = require("supertest");
//import request from "supertest";
import {initApp} from "../../../src/initApp";
import {db} from "../../../src/ioc";
import {BlogOutputModel} from "../../../src/features/blogs/types/output/blogOutput.model";
import {PostOutputModel} from "../../../src/features/posts/types/output/postOutput.model";
import {appConfig} from "../../../src/common/settings/config";
import {routersPaths} from "../../../src/common/settings/paths";
import {BlogDto, BlogPostDto, createString, PostDto, testingDtosCreator} from "../testingDtosCreator";
import {createBlog} from "../blogs/utils/createGetBlogs";
import {
    createBlogPost,
    createPost,
    getPostById,
    getPosts,
    getBlogPosts,
    getPostsQty,
    getBlogPostsQty
} from "./util/createGetPosts";
import {OutputErrorsType} from "../../../src/common/types/outputErrors.type";
import {validateErrorsObject} from "../validateErrorsObject";
import {LikeStatus} from "../../../src/common/types/enum/likeStatus";


describe('/posts', () => {
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

    afterAll( done => {
        done();
    })
    //additional variables
    let blogDtos: BlogDto[];
    let newBlog: BlogOutputModel;
    let blogId, oldBlogId: string;
    let firstBlogName: string;
    //////////////////////////////
    const noValidBlogPostDto = testingDtosCreator.createBlogPostDto({
        title: createString(31),
        shortDescription: createString(101),
        content: createString(1001),
    })
    const noValidPostDto = {...noValidBlogPostDto, blogId: '1'}

    let postDtos: PostDto[];
    let blogPostDto: BlogPostDto;
    let newPost: PostOutputModel;
    let newBlogPost: PostOutputModel
    let updatedPost: PostOutputModel;
    let newPostId, newBlogPostId: string;

    //+POST request from /blogId:/post route
    describe(`POST -> "/posts":`, ()=>{



        it(`POST -> "/posts": Can't create post with not valid data: STATUS 400; Should return errors if passed body is incorrect;`, async () => {
            //запрос на создание нового поста c невалидными данными
            const resPost = await request(app)
                .post(routersPaths.posts)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(noValidPostDto)
                .expect(400)
            const resPostBody:OutputErrorsType = resPost.body
            //проверка тела ответа на ошибки валидации входных данных по созданию поста
            const expectedErrorsFields = [ 'title', 'shortDescription', 'content', 'blogId' ]
            validateErrorsObject(resPostBody, expectedErrorsFields)
            //запрос на получение постов, проверка на ошибочное создание поста в БД
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(0)
        })

        it(`POST -> "/posts": Can't create post without authorization: STATUS 401`, async () => {
            //запрос на создание нового поста без авторизации
            await request(app)
                .post(routersPaths.posts)
                .send(noValidPostDto)
                .expect(401);
            //запрос на получение постов, проверка на ошибочное создание поста в БД
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(0)
        })

        it(`POST -> "/posts": Create new post: STATUS 201; used additional methods: POST -> /blogs `, async () => {
            //additional method create blogDto and then create new blog, take blogId for post creations
            blogDtos = testingDtosCreator.createBlogDtos(2)
            //запрос на создание нового блога
            newBlog = await createBlog(app, blogDtos[0])
            blogId = newBlog.id
            firstBlogName = newBlog.name
            //main methods - post creations with blogId
            postDtos = testingDtosCreator.createPostDtos(2, blogId )
            //запрос на создание нового поста
            newPost = await createPost(app, postDtos[0])
            newPostId = newPost.id
            //проверка соответствия схемы представления ответа по полям модели ответа, и значений полученых
            expect(newPost).toEqual({
                id: expect.any(String),
                ...postDtos[0],
                blogName: firstBlogName,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?$/),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.None,
                    newestLikes: []
                }
            })
            //console.log(newPost)
            //на всякий случай проверяем не произошла ли ошибка записи в БД:
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(1)
            //запрос на получение созданного поста по Id - проверка создания в БД нового поста
            const foundPost = await getPostById(app, newPostId)
            expect(foundPost).toEqual(newPost)
        })

    })

    describe(`POST -> "/blogs/:id/posts":`, ()=>{

        it(`POST -> "/blogs/:id/posts": Can't create post with not valid data: STATUS 400; Should return errors if passed body is incorrect;`, async () => {
            //запрос на создание нового поста c невалидными данными
            const resPost = await request(app)
                .post(`${routersPaths.blogs}/${blogId}/posts`)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(noValidBlogPostDto)
                .expect(400)
            const resPostBody:OutputErrorsType = resPost.body
            //проверка тела ответа на ошибки валидации входных данных по созданию поста
            const expectedErrorsFields = [ 'title', 'shortDescription', 'content' ]
            validateErrorsObject(resPostBody, expectedErrorsFields)
            //запрос на получение постов, проверка на ошибочное создание поста в БД
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(1)
        })

        it(`POST -> "/blogs/:id/posts": Can't create post without authorization: STATUS 401`, async () => {
            //запрос на создание нового поста без авторизации
            await request(app)
                .post(routersPaths.posts)
                .send(noValidBlogPostDto)
                .expect(401);
            //запрос на получение постов, проверка на ошибочное создание поста в БД
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(1)
        })

        it(`POST -> "/blogs/:id/posts": Can't found with id. STATUS 404;`, async () => {
            blogPostDto = testingDtosCreator.createBlogPostDto({})
            //запрос на обонвление блога по неверному/несуществующему id
            await request(app)
                .post(`${routersPaths.blogs}/1/posts`)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(blogPostDto)
                .expect(404)
            //запрос на получение постов, проверка на ошибочное создание поста в БД
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(1)
        })

        it(`POST -> "/blogs/:id/posts": Create new post: STATUS 201;`, async () => {
            //запрос на создание нового блога 2
            newBlog = await createBlog(app, blogDtos[1])
            oldBlogId = blogId
            blogId = newBlog.id
            //запрос на создание нового поста через blogId роут
            newBlogPost = await createBlogPost(app, blogId, blogPostDto)
            newBlogPostId = newBlogPost.id
            //проверка соответствия схемы представления ответа по полям модели ответа, и значений полученых
            expect(newBlogPost).toEqual({
                id: expect.any(String),
                ...blogPostDto,
                blogId,
                blogName: newBlog.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.None,
                    newestLikes: []
                }
            });
            //console.log(newBlogPost)
            //на всякий случай проверяем не произошла ли ошибка записи в БД:
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(2)
            //запрос на получение созданного поста по Id - проверка создания в БД нового блога
            const foundPost = await getPostById(app, newBlogPostId)
            expect(foundPost).toEqual(newBlogPost)
        })

    })
    //+GET request from /blogId:/post route
    describe(`GET -> "/posts":`, ()=>{

        it(`GET -> "/posts": Return pagination Object with blogs array keys - items. STATUS 200; add.: blog created in prev test`, async () => {
            //запрос на получение постов - проверка создания в БД нового поста
            const foundPosts = await getPosts(app)
            expect(foundPosts).toEqual({
                pagesCount:	expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [newBlogPost, newPost]
                //items: expect.any(Array)
            })
        })

    })

    describe(`GET -> "/posts/:id":`, () =>{

        it(`GET -> "/blogs/:id": Can't found with id. STATUS 404;`, async () => {
            await request(app)
                .get(routersPaths.blogs+'/1')
                .expect(404)
        })

    })

    describe(`GET -> "/blogs/:id/posts":`, () =>{

        it(`GET -> "/blogs/:id/posts": Can't found with id. STATUS 404;`, async () => {
            await request(app)
                .get(`${routersPaths.blogs}/1/posts`)
                .expect(404)
        })

        it(`GET -> "/blogs/:id/posts": found blogId posts: STATUS 200;`, async () => {
            const foundPosts = await getBlogPosts(app, blogId)
            //console.log(foundPosts)
            expect(foundPosts).toEqual({
                pagesCount:	expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [newBlogPost]
                //items: expect.any(Array)
            })
        })

    })

    ////////////////////////////////////////////
    describe(`PUT -> "/posts":`, ()=>{

        it(`PUT -> "/posts/:id": Can't update post with not valid data: STATUS 400; Should return errors if passed body is incorrect;`, async () => {
            //запрос на обонвление существующего блога по id с невалидными данными
            const resPut = await request(app)
                .put(routersPaths.posts+"/" + newBlogPostId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(noValidPostDto)
                .expect(400)
            const resPutBody:OutputErrorsType = resPut.body
            //проверка тела ответа на ошибки валидации входных данных по созданию поста
            const expectedErrorsFields = [ 'title', 'shortDescription', 'content', 'blogId' ]
            validateErrorsObject(resPutBody, expectedErrorsFields)
            //запрос на получение поста, проверка на ошибочное обновлние поста в БД
            const foundPost = await getPostById(app, newBlogPostId)
            expect(foundPost).toEqual(newBlogPost)
        })

        it(`PUT -> "/posts/:id": Can't update post without authorization: STATUS 401; Should return errors if passed body is incorrect;`, async () => {
            //запрос на обонвление существующего блога по id с невалидными данными
            await request(app)
                .put(routersPaths.posts+"/" + newBlogPostId)
                .send(noValidPostDto)
                .expect(401)
            //запрос на получение поста, проверка на ошибочное обновлние поста в БД
            const foundPost = await getPostById(app, newBlogPostId)
            expect(foundPost).toEqual(newBlogPost)
        })

        it(`PUT -> "/posts/:id": Can't found with id. STATUS 404;`, async () => {
            //запрос на обонвление блога по неверному/несуществующему id
            await request(app)
                .put(routersPaths.posts+'/1')
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(postDtos[1])
                .expect(404)
            //запрос на получение поста, проверка на ошибочное обновлние поста в БД
            const foundPost = await getPostById(app, newBlogPostId)
            expect(foundPost).toEqual(newBlogPost)
        })

        it(`PUT -> "/posts/:id": Update new blogPost; STATUS 204; no content;`, async () => {
            //запрос на обонвление существующего по id
            await request(app)
                .put(routersPaths.posts+"/" + newBlogPostId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .send(postDtos[1])
                .expect(204)
            //запрос на получение обновленного блога по Id - проверка операции обновления нового блога в БД
            updatedPost = await getPostById(app, newBlogPostId)
            const expectedPost = {...newBlogPost, ...postDtos[1], blogName: firstBlogName }
            expect(updatedPost).toEqual(expectedPost)
            //после обновления нового поста нового блога на старый блог - blogId в postDtos - сохранен, blogName - firstBlogName
            //проверяем что количество постов старого блога - первого стало два, а количество постов в новом блоге - 0
            const oldBlogPostsQty = await getBlogPostsQty(app, oldBlogId)
            const newBlogPostsQty = await getBlogPostsQty(app, blogId)
            expect(oldBlogPostsQty).toBe(2)
            expect(newBlogPostsQty).toBe(0)
            //ну и проверим пагинацию постов первого старого блога по запросу
            //console.log(oldBlogId)
            const foundPosts = await getBlogPosts(app, oldBlogId)
            //console.log(foundPosts)
            expect(foundPosts).toEqual({
                pagesCount:	expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [updatedPost, newPost]
                //items: expect.any(Array)
            })

        })

    })

    describe(`DELETE -> "/posts/:id"`, ()=>{

        it(`DELETE -> "/posts/:id": Can't delete post without authorization: STATUS 401;`, async () => {
            //запрос на удаление существующего поста по id без авторизации
            await request(app)
                .delete(routersPaths.posts+"/" + newPostId)
                .expect(401)
            //запрос на получение постов, проверка на ошибочное удаление поста в БД
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(2)
        })

        it(`DELETE -> "/posts/:id": Can't found with id. STATUS 404;`, async () => {
            //запрос на удаление поста по неверному/несуществующему id
            await request(app)
                .delete(routersPaths.posts+'/1')
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(404)
            //запрос на получение постов, проверка на ошибочное удаление поста в БД
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(2)
        })

        it(`DELETE -> "/blogs/:id": Delete updated blog; STATUS 204; no content; used additional methods: GET -> /blogs`, async () => {
            //запрос на удаление существующего поста по id
            await request(app)
                .delete(routersPaths.posts+"/" + newPostId)
                .auth(ADMIN_LOGIN, ADMIN_PASS)
                .expect(204)
            //запрос на получение постов, проверка на ошибочное удаление поста в БД
            const postCounter = await getPostsQty(app)
            expect(postCounter).toEqual(1)
        })

    })

})