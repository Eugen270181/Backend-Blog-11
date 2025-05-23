import {container} from "../../../src/composition-root";
import {PostOutputModel} from "../../../src/features/posts/types/output/postOutput.model";
import {testingDtosCreator, TokensDto} from "../testingDtosCreator";
import {UserOutputModel} from "../../../src/features/users/types/output/userOutput.type";
import {initApp} from "../../../src/initApp";
import {appConfig} from "../../../src/common/settings/config";
import {createUsersBySa} from "../users/utils/createGetUsers";
import {getArrTokensWithUsersLogin} from "../auth/utils/createGetAuth";
import {createBlog} from "../blogs/utils/createGetBlogs";
import {createPosts, getPostById} from "../posts/util/createGetPosts";
import {LikeStatus} from "../../../src/common/types/enum/likeStatus";
import {checkCommentLikeData, checkPostLikeData, createCommentLike, createPostLike} from "./util/createGetLikes";
import {routersPaths} from "../../../src/common/settings/paths";
import {jwtServices} from "../../../src/common/adapters/jwtServices";
import {LikePostDocument, LikePostModelType} from "../../../src/features/likes/domain/likePost.entity";
import {createPostComments, getCommentById} from "../comments/util/createGetComments";
import {CommentOutputModel} from "../../../src/features/comments/types/output/commentOutput.model";
import {LikeCommentDocument, LikeCommentModelType} from "../../../src/features/likes/domain/likeComment.entity";
import {DB} from "../../../src/common/module/db/DB";
import {TYPES} from "../../../src/ioc-types";

const request = require("supertest");
//import request from "supertest";

///hometask_12/api/posts/{postId}/like-status

describe('LIKE_TESTS',  () => {

    const app=initApp()
    const db = container.get<DB>(TYPES.DB)

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

    const likePostModel = container.get<LikePostModelType>(TYPES.LikePostModel)
    const likeCommentModel = container.get<LikeCommentModelType>(TYPES.LikeCommentModel)

    const noneLikeDto = { likeStatus: LikeStatus.None }
    const likeDto = { likeStatus: LikeStatus.Like }
    const dislikeDto = { likeStatus: LikeStatus.Dislike }

    let posts: PostOutputModel[], comments: CommentOutputModel[]
    let users: UserOutputModel[], tokens: TokensDto[]

    /////////////////////////////////////POSTS_LIKES////////////////////////////
    //400,401,404,204
    describe(`PUT -> "posts/:id/like-status":`, () => {

        it(`PUT -> "posts/:id/like-status":Ok. 204`, async () =>{
            //0. Создание 4 пользователей суперадмином, их авторизация и получение токенов
            users = await createUsersBySa(app,4)
            tokens = await getArrTokensWithUsersLogin(app, users)
            //1. Создание блога
            const blog = await createBlog(app)
            const blogId = blog.id
            //2. Создание 2-ух постов(предвар.создание дтошек)
            const postDtos = testingDtosCreator.createPostDtos(2, blogId )
            posts = await createPosts(app, postDtos)
            //3. Создание валидного лайка юзера 1 к первому посту
            await createPostLike(app, tokens[0].accessToken, posts[0].id, likeDto)
            //4. Проверка создания через БД лайка поста, так как нет гет-запросов по лайкам
            const foundPostLikeInDB: LikePostDocument = await likePostModel
                .findOne({ authorId: users[0].id , postId: posts[0].id })
                .lean() as LikePostDocument
            expect(foundPostLikeInDB.status).toBe(LikeStatus.Like)
            //5. Получить замапленый пост по айди с авториз.данными и без первого пользователя
            //проверить счетчики, статус и массив трехлайков - добавлен ли туда лайк
            const post1WithAuth = await getPostById(app, posts[0].id, tokens[0].accessToken)
            const post1WithoutAuth = await getPostById(app, posts[0].id)
            //console.log(post1WithAuth)
            const likeDetailArr = [{ userId:users[0].id, login: users[0].login }]
            checkPostLikeData( post1WithAuth, 1, 0, LikeStatus.Like, likeDetailArr)
            checkPostLikeData( post1WithoutAuth, 1, 0, LikeStatus.None, likeDetailArr)
        })

        it(`PUT -> "posts/:id/like-status":No Auth. 401`, async () =>{
            //запрос на создание нового лайка к посту без авторизации
            await request(app)
                .put(`${routersPaths.posts}/${posts[0].id}/like-status`)
                .send(likeDto)
                .expect(401)
            //создадим невалидный токен
            const noValidAcessToken = await jwtServices
                .createJWT({userId:'123'}, appConfig.AT_SECRET, '10s')
            await request(app)
                .put(`${routersPaths.posts}/${posts[0].id}/like-status`)
                .set('Authorization',`bearer ${noValidAcessToken}`)
                .send(likeDto)
                .expect(401)
        })

        it(`PUT -> "posts/:id/like-status":Not valid data. 400`, async () =>{
            await request(app)
                .put(`${routersPaths.posts}/${posts[0].id}/like-status`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send({ likeStatus: "Abrakadabra"})
                .expect(400)
        })

        it(`PUT -> "posts/:id/like-status":Not found. 404`, async () =>{
            await request(app)
                .put(`${routersPaths.posts}/1/like-status`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send(likeDto)
                .expect(404)
        })

    })
    //0. проверка вывода - мой статус при гет запросах конкретных постов...проверка в Бд изменения сущности лайка при запросах на это
    //1. проверка работы счетчиков лайков/дизлайков у постов...по выводу по гет запросу конкретного поста
    //2. проверка работы функционала добавления 3 последних лайков различных пользователей
    describe(`LIKE_POSTS_TESTING_SCENARIOUS`, () => {

        it(`changeLikePostInDb`, async () => {

            await createPostLike(app, tokens[0].accessToken, posts[0].id, dislikeDto)
            const foundPostLikeInDB1: LikePostDocument = await likePostModel
                .findOne({ authorId: users[0].id , postId: posts[0].id })
                .lean() as LikePostDocument
            expect(foundPostLikeInDB1.status).toBe(LikeStatus.Dislike)
            await createPostLike(app, tokens[0].accessToken, posts[0].id, likeDto)
            const foundPostLikeInDB2: LikePostDocument = await likePostModel
                .findOne({ authorId: users[0].id , postId: posts[0].id })
                .lean() as LikePostDocument
            expect(foundPostLikeInDB2.status).toBe(LikeStatus.Like)
            await createPostLike(app, tokens[0].accessToken, posts[0].id, noneLikeDto)
            const foundPostLikeInDB3: LikePostDocument = await likePostModel
                .findOne({ authorId: users[0].id , postId: posts[0].id })
                .lean() as LikePostDocument
            expect(foundPostLikeInDB3.status).toBe(LikeStatus.None)

            const post1WithAuth = await getPostById(app, posts[0].id, tokens[0].accessToken)
            checkPostLikeData( post1WithAuth, 0, 0, LikeStatus.None, [] )

        })

        it(`checkLikeDislikeCounter`, async () => {
            //пост 1 - 2 лайка 2 дизлайка разных юзероа
            await createPostLike(app, tokens[0].accessToken, posts[0].id, likeDto)
            await createPostLike(app, tokens[1].accessToken, posts[0].id, likeDto)
            await createPostLike(app, tokens[2].accessToken, posts[0].id, dislikeDto)
            await createPostLike(app, tokens[3].accessToken, posts[0].id, dislikeDto)
            const post1WithAuth = await getPostById(app, posts[0].id, tokens[0].accessToken)

            checkPostLikeData( post1WithAuth, 2, 2, LikeStatus.Like)

        })

        it(`checkWork3LastLikes`, async () => {
            //пост 2 - 4 лайка разных пользователей
            await createPostLike(app, tokens[0].accessToken, posts[1].id, likeDto)
            await createPostLike(app, tokens[1].accessToken, posts[1].id, likeDto)
            await createPostLike(app, tokens[2].accessToken, posts[1].id, dislikeDto)
            await createPostLike(app, tokens[3].accessToken, posts[1].id, likeDto)
            const post2WithAuth = await getPostById(app, posts[1].id, tokens[1].accessToken)
            const arrDetail = [
                { userId:users[3].id, login: users[3].login },
                { userId:users[1].id, login: users[1].login },
                { userId:users[0].id, login: users[0].login },
            ]

            checkPostLikeData( post2WithAuth, 3, 1, LikeStatus.Like, arrDetail)
        })

    })

    /////////////////////////////////////COMMENTS_LIKES////////////////////////////
    //400,401,404,204
    describe(`PUT -> "comments/:id/like-status":`, () => {

        it(`PUT -> "comments/:id/like-status":Ok. 204`, async () =>{
            //2. Создание 2-ух комментов (предвар.создание дтошек) к первому посту
            const commentDtos = testingDtosCreator.createCommentDtos(2 )
            const postId = posts[0].id;
            comments = await createPostComments(app, tokens[0].accessToken, postId, commentDtos)
            //3. Создание валидного лайка юзера 1 к первому комменту
            await createCommentLike(app, tokens[0].accessToken, comments[0].id, likeDto)
            //4. Проверка создания через БД лайка поста, так как нет гет-запросов по лайкам
            const foundCommentLikeInDB: LikeCommentDocument = await likeCommentModel
                .findOne({ authorId: users[0].id , commentId: comments[0].id })
                .lean() as LikeCommentDocument
            expect(foundCommentLikeInDB.status).toBe(LikeStatus.Like)
            //5. Получить замапленый коммент по айди с авториз.данными и без первого пользователя
            //проверить счетчики и статус лайков - добавлен ли туда лайк
            const comment1WithAuth = await getCommentById(app, comments[0].id, tokens[0].accessToken)
            const comment1WithoutAuth = await getCommentById(app, comments[0].id)

            checkCommentLikeData( comment1WithAuth, 1, 0, LikeStatus.Like)
            checkCommentLikeData( comment1WithoutAuth, 1, 0, LikeStatus.None)
        })

        it(`PUT -> "comments/:id/like-status":No Auth. 401`, async () =>{
            //запрос на создание нового лайка к посту без авторизации
            await request(app)
                .put(`${routersPaths.comments}/${comments[0].id}/like-status`)
                .send(likeDto)
                .expect(401)
        })

        it(`PUT -> "comments/:id/like-status":Not valid data. 400`, async () =>{
            await request(app)
                .put(`${routersPaths.comments}/${comments[0].id}/like-status`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send({ likeStatus: "Abrakadabra"})
                .expect(400)
        })

        it(`PUT -> "comments/:id/like-status":Not valid data. 404`, async () =>{
            await request(app)
                .put(`${routersPaths.comments}/1/like-status`)
                .set('Authorization',`bearer ${tokens[0].accessToken}`)
                .send(likeDto)
                .expect(404)
        })

    })

    //0. проверка вывода - мой статус лайка при гет запросах конкретных комментов...проверка в Бд изменения сущности лайка при запросах на это
    //1. проверка работы счетчиков лайков/дизлайков у комментов..по выводу по гет запросу конкретного коммента
    describe(`LIKE_COMMENT_TESTING_SCENARIOUS`, () => {

        it(`changeLikeCommentInDb`, async () => {

            await createCommentLike(app, tokens[0].accessToken, comments[0].id, dislikeDto)
            const foundCommentLikeInDB1: LikeCommentDocument = await likeCommentModel
                .findOne({ authorId: users[0].id , commentId: comments[0].id })
                .lean() as LikeCommentDocument
            expect(foundCommentLikeInDB1.status).toBe(LikeStatus.Dislike)

            await createCommentLike(app, tokens[0].accessToken, comments[0].id, likeDto)
            const foundCommentLikeInDB2: LikeCommentDocument = await likeCommentModel
                .findOne({ authorId: users[0].id , commentId: comments[0].id })
                .lean() as LikeCommentDocument
            expect(foundCommentLikeInDB2.status).toBe(LikeStatus.Like)

            await createCommentLike(app, tokens[0].accessToken, comments[0].id, noneLikeDto)
            const foundCommentLikeInDB3: LikeCommentDocument = await likeCommentModel
                .findOne({ authorId: users[0].id , commentId: comments[0].id })
                .lean() as LikeCommentDocument
            expect(foundCommentLikeInDB3.status).toBe(LikeStatus.None)

            const comment1WithAuth = await getCommentById(app, comments[0].id, tokens[0].accessToken)
            checkCommentLikeData( comment1WithAuth, 0, 0, LikeStatus.None )

        })

        it(`checkLikeDislikeCounter`, async () => {
            //коммент 1 - 2 лайка 2 дизлайка разных юзероа
            await createCommentLike(app, tokens[0].accessToken, comments[0].id, likeDto)
            await createCommentLike(app, tokens[1].accessToken, comments[0].id, likeDto)
            await createCommentLike(app, tokens[2].accessToken, comments[0].id, dislikeDto)
            await createCommentLike(app, tokens[3].accessToken, comments[0].id, dislikeDto)
            const comment1WithAuth = await getCommentById(app, comments[0].id, tokens[0].accessToken)

            checkCommentLikeData( comment1WithAuth, 2, 2, LikeStatus.Like)

        })

    })

})