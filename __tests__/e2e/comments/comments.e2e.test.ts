import {getPostsQty} from "../posts/util/createGetPosts";

const request = require("supertest");
//import request from "supertest";
import {initApp} from "../../../src/initApp";
import {db} from "../../../src/ioc";
import {appConfig} from "../../../src/common/settings/config";
import {routersPaths} from "../../../src/common/settings/paths";
//put delete get роут - /comments/:id
//post get роут - /posts/:postId/comments


describe('/comments', () => {
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


    //TODO but first  todo auth tests!!!
    describe(`POST -> "/comments":`, ()=>{

        it(`POST -> "/posts/:id/comments": Can't create comment without authorization: STATUS 401`, async () => {
            //запрос на создание нового поста без авторизации
            await request(app)
                .post(`${routersPaths.posts}/1/comments`)
                .send({})
                .expect(401);
        })




    })

})