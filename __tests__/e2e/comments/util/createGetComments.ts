import {routersPaths} from "../../../../src/common/settings/paths";

const request = require("supertest");
//import request from 'supertest'
import {ADMIN_LOGIN, ADMIN_PASS} from "../../../../src/common/middleware/adminMiddleware";
import {BlogPostDto, CommentDto, PostDto, testingDtosCreator} from "../../testingDtosCreator";
import {PostOutputModel} from "../../../../src/features/posts/types/output/postOutput.model";
import {Pagination} from "../../../../src/common/types/pagination.type";
import {BlogOutputModel} from "../../../../src/features/blogs/types/output/blogOutput.model";
import {CommentOutputModel} from "../../../../src/features/comments/types/output/commentOutput.model";




export const createComment = async (app: any, dto: CommentDto ):Promise<CommentOutputModel> => {

    const resp = await request(app).post(routersPaths.comments).auth(ADMIN_LOGIN, ADMIN_PASS).send(dto).expect(201)

    return resp.body
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

export const getPostById = async (app: any, postId: string):Promise<PostOutputModel> => {

    const resp = await request(app).get(`${routersPaths.posts}/${postId}`).expect(200)

    return resp.body
}

export const getBlogPosts = async (app: any, blogId: string):Promise<Pagination<PostOutputModel>> => {

    const resp = await request(app).get(`${routersPaths.blogs}/${blogId}/posts`).expect(200)

    return resp.body
}

export const getBlogPostsQty = async (app:any, blogId: string):Promise<Number> => (await getBlogPosts(app, blogId)).totalCount