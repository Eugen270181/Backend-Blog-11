import {container} from "../../../src/composition-root";

const request = require("supertest");
//import request from "supertest";

import { createPosts } from "../posts/util/createGetPosts";
import {initApp} from "../../../src/initApp";
import {appConfig} from "../../../src/common/settings/config";
import {routersPaths} from "../../../src/common/settings/paths";
import {createBlog} from "../blogs/utils/createGetBlogs";
import {CommentDto, createString, testingDtosCreator, TokensDto} from "../testingDtosCreator";
import {createPostComments, getCommentById, getPostComments} from "./util/createGetComments";
import {createUsersBySa} from "../users/utils/createGetUsers";
import {getArrTokensWithUsersLogin} from "../auth/utils/createGetAuth";
import {PostOutputModel} from "../../../src/features/posts/types/output/postOutput.model";
import {CommentOutputModel} from "../../../src/features/comments/types/output/commentOutput.model";
import {UserOutputModel} from "../../../src/features/users/types/output/userOutput.type";
import {LikeStatus} from "../../../src/common/types/enum/likeStatus";
import {jwtServices} from "../../../src/common/adapters/jwtServices";
import {OutputErrorsType} from "../../../src/common/types/outputErrors.type";
import {validateErrorsObject} from "../validateErrorsObject";
import {DB} from "../../../src/common/module/db/DB";



describe('/comments',  () => {

    const app=initApp()
    const db = container.get<DB>(DB)

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

    const noValidCommentDto = {content: 'fg'}
    const updateCommentDto = { content: createString(25) }

    let posts: PostOutputModel[], comments: CommentOutputModel[], commentDtos: CommentDto[]
    let users: UserOutputModel[], tokens: TokensDto[]

    describe(`POST -> "posts/:id/comments":`, ()=>{

        it(`POST -> "/posts/:id/comments": Create new comment: STATUS 201;`, async () => {
            //0. Создание 2 пользователей суперадмином, их авторизация и получение токенов
            users = await createUsersBySa(app,2)
            tokens = await getArrTokensWithUsersLogin(app, users)
            //1. Создание блога
            const blog = await createBlog(app)
            const blogId = blog.id
            //2. Создание 2-ух постов(предвар.создание дтошек)
            const postDtos = testingDtosCreator.createPostDtos(2, blogId )
            posts = await createPosts(app, postDtos)
            //3. Создание валидных 2 комментов от юзера 1 к первому посту(предвар.создание дтошек)
            commentDtos = testingDtosCreator.createCommentDtos(2 )
            comments = await createPostComments(app, tokens[0].accessToken, posts[0].id, commentDtos )
            //проверяем замапленые объекты общим шаблоном
            expect(comments).toEqual(expect.arrayContaining([
                {
                    id: expect.any(String),
                    content: expect.any(String),
                    commentatorInfo: {
                        userId: expect.any(String),
                        userLogin: expect.any(String),
                    },
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?$/),
                    likesInfo: expect.objectContaining({
                        likesCount: expect.any(Number),
                        dislikesCount: expect.any(Number),
                        myStatus: expect.stringMatching(/None|Like|Dislike/),
                    }),
                }
            ]));
            //конкретнее
            expect(comments[0]).toEqual({
                id: expect.any(String),
                ...commentDtos[0],
                commentatorInfo: {
                    userId: users[0].id,
                    userLogin: users[0].login,
                },
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?$/),
                likesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.None,
                }
            });

            expect(comments).toHaveLength(2);
        })

        it(`POST -> "/posts/:id/comments": Can't create comment without authorization: STATUS 401;`, async () => {
            //запрос на создание нового поста без авторизации
            await request(app)
                .post(`${routersPaths.posts}/1/comments`)
                .send({})
                .expect(401);
            //создадим невалидный токен
            const noValidAcessToken = await jwtServices
                .createJWT({userId:'123'}, appConfig.AT_SECRET, '10s')
            await request(app)
                .post(`${routersPaths.posts}/1/comments`)
                .set('Authorization',`bearer ${noValidAcessToken}`)
                .send({})
                .expect(401);
        })

        it(`POST -> "/posts/:id/comments": Not valid Data. STATUS 400;`,async () => {
            const resPost = await request(app)
                .post(`${routersPaths.posts}/${posts[0].id}/comments`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send(noValidCommentDto)
                .expect(400)
            const resPostBody:OutputErrorsType = resPost.body
            //проверка тела ответа на ошибки валидации входных данных по созданию юзера
            const expectedErrorsFields = ['content']
            validateErrorsObject(resPostBody, expectedErrorsFields)
        })

        it(`POST -> "/posts/:id/comments": Not found. STATUS 404;`,async () => {

            await request(app)
                .post(`${routersPaths.posts}/1/comments`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send({content:comments[0].content})
                .expect(404)
        })

    })

    describe(`GET -> "posts/:id/comments":`, ()=>{

        it(`GET -> "/posts/:id/comments": Not found. STATUS 404;`,async () => {

            await request(app)
                .get(`${routersPaths.posts}/1/comments`)
                .expect(404)
        })

        it(`GET -> "/posts/:id/comments": Ok. STATUS 200;`,async () => {

            const foundComments = await getPostComments(app, posts[0].id)
            //console.log(foundPosts)
            expect(foundComments).toEqual({
                pagesCount:	expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [comments[1], comments[0]],
                //items: expect.any(Array)
            })

        })

    })

    describe(`GET -> "comments/:id":`, ()=> {

        it(`GET -> "comments/:id": Not found. STATUS 404;`,async () => {

            await request(app)
                .get(`${routersPaths.comments}/1`)
                .expect(404)
        })

        it(`GET -> "comments/:id": Ok. STATUS 200;`,async () => {

            const foundCommentById = await getCommentById(app, comments[0].id)
            //console.log(foundPosts)
            expect(foundCommentById).toEqual(comments[0])

        })

    })

    describe(`PUT -> "comments/:id":`, ()=> {

        it(`PUT -> "comments/:id": Not found. STATUS 401;`,async () => {

            await request(app)
                .put(`${routersPaths.comments}/1`)
                .send({})
                .expect(401)
        })

        it(`PUT -> "comments/:id": Not found. STATUS 400;`,async () => {

            await request(app)
                .put(`${routersPaths.comments}/${comments[0].id}`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send(noValidCommentDto)
                .expect(400)
        })

        it(`PUT -> "comments/:id": Not found. STATUS 404;`,async () => {

            await request(app)
                .put(`${routersPaths.comments}/1`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send(commentDtos[0])
                .expect(404)
        })

        it(`PUT -> "comments/:id": Forbidden. STATUS 403;`,async () => {

            const resPut = await request(app)
                .put(`${routersPaths.comments}/${comments[0].id}`)
                .set('Authorization',`bearer ${tokens[1].accessToken}`)
                .send(updateCommentDto)
                .expect(403)

            //console.log(foundPosts)
            //expect(foundCommentById).toEqual(comments[0])

        })

        it(`PUT -> "comments/:id": Ok. STATUS 204;`,async () => {

            const resPut = await request(app)
                .put(`${routersPaths.comments}/${comments[0].id}`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send(updateCommentDto)
                .expect(204)

            const expectedComment = {...comments[0], ...updateCommentDto }
            const updatedComment = await getCommentById(app, comments[0].id)
            expect(updatedComment).toEqual(expectedComment)
        })

    })

    describe(`DELETE -> "comments/:id"`, () => {

        it(`DELETE -> "comments/:id": Not found. STATUS 401;`,async () => {

            await request(app)
                .delete(`${routersPaths.comments}/1`)
                .send({})
                .expect(401)
        })

        it(`DELETE -> "comments/:id": Not found. STATUS 404;`,async () => {

            await request(app)
                .delete(`${routersPaths.comments}/1`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .expect(404)
        })

        it(`DELETE -> "comments/:id": Forbidden. STATUS 403;`,async () => {

            await request(app)
                .delete(`${routersPaths.comments}/${comments[0].id}`)
                .set('Authorization',`bearer ${tokens[1].accessToken}`)
                .expect(403)

        })

        it(`DELETE -> "comments/:id": Ok. STATUS 204;`,async () => {

            await request(app)
                .delete(`${routersPaths.comments}/${comments[0].id}`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .expect(204)

            //можно проверить удалился ли из Бд черз гет по айди
            await request(app)
                .get(`${routersPaths.comments}/${comments[0].id}`)
                .expect(404)
        })

    })

})