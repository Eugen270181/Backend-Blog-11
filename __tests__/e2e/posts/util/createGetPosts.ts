const request = require("supertest");
//import request from 'supertest'

import {routersPaths} from "../../../../src/common/settings/paths";
import {BlogPostDto, PostDto, testingDtosCreator} from "../../testingDtosCreator";
import {PostOutputModel} from "../../../../src/features/posts/types/output/postOutput.model";
import {Pagination} from "../../../../src/common/types/pagination.type";
import {ADMIN_LOGIN, ADMIN_PASS} from "../../../../src/common/middleware/guardMiddlewares";


export const createPost = async (app: any, dto: PostDto ):Promise<PostOutputModel> => {

    const resp = await request(app).post(routersPaths.posts).auth(ADMIN_LOGIN, ADMIN_PASS).send(dto).expect(201)

    return resp.body
}

export const createPosts = async (app: any, dtos: PostDto[] ):Promise<PostOutputModel[]> => {
    const posts:PostOutputModel[]=[]

    for (let i = 0; i < dtos.length; i++) {
        const post = await createPost(app, dtos[i])
        posts.push(post)
    }

    return posts
}

export const createBlogPost = async (app: any, blogId: string, blogPostDto?: BlogPostDto ):Promise<PostOutputModel> => {

    const dto = blogPostDto ?? testingDtosCreator.createBlogPostDto({});

    const resp = await request(app).post(`${routersPaths.blogs}/${blogId}/posts`).auth(ADMIN_LOGIN, ADMIN_PASS).send(dto).expect(201)

    return resp.body
}

export const getPosts = async (app: any):Promise<Pagination<PostOutputModel>> => {

    const resp = await request(app).get(routersPaths.posts).expect(200)

    return resp.body
}

export const getPostsQty = async (app:any):Promise<Number> => (await getPosts(app)).totalCount

export const getPostById = async (app: any, postId: string, acessToken?: string):Promise<PostOutputModel> => {

    const resp = await request(app)
        .get(`${routersPaths.posts}/${postId}`)
        .set('Authorization',acessToken?`bearer ${acessToken}`:``)
        expect(200)

    return resp.body
}

export const getBlogPosts = async (app: any, blogId: string):Promise<Pagination<PostOutputModel>> => {

    const resp = await request(app).get(`${routersPaths.blogs}/${blogId}/posts`).expect(200)

    return resp.body
}

export const getBlogPostsQty = async (app:any, blogId: string):Promise<Number> => (await getBlogPosts(app, blogId)).totalCount