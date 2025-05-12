const request = require("supertest");
//import request from 'supertest'

import {ADMIN_LOGIN, ADMIN_PASS} from "../../../../src/common/middleware/guardMiddlewares";
import {BlogDto, testingDtosCreator} from "../../testingDtosCreator";
import {routersPaths} from "../../../../src/common/settings/paths";
import {BlogOutputModel} from "../../../../src/features/blogs/types/output/blogOutput.model";
import {Pagination} from "../../../../src/common/types/pagination.type";



export const createBlog = async (app: any, blogDto?: BlogDto):Promise<BlogOutputModel> => {

    const dto = blogDto ?? testingDtosCreator.createBlogDto({});

    const resp = await request(app).post(routersPaths.blogs).auth(ADMIN_LOGIN, ADMIN_PASS).send(dto).expect(201)

    return resp.body
}

export const getBlogs = async (app: any):Promise<Pagination<BlogOutputModel>> => {

    const resp = await request(app).get(routersPaths.blogs).expect(200)

    return resp.body
}

export const getBlogsQty = async (app:any):Promise<Number> => (await getBlogs(app)).totalCount

export const getBlogById = async (app: any, blogId: string):Promise<BlogOutputModel> => {

    const resp = await request(app).get(`${routersPaths.blogs}/${blogId}`).expect(200)

    return resp.body
}
export const createBlogs = async (app: any, count: number):Promise<BlogOutputModel[]> => {
    const blogs:BlogOutputModel[] = [];

    const blogDtos:BlogDto[] = testingDtosCreator.createBlogDtos(count);

    for (let i = 0; i < count; i++) {
        const resp = await request(app).post(routersPaths.blogs).auth(ADMIN_LOGIN, ADMIN_PASS).send(blogDtos[i]).expect(201)
        blogs.push(resp.body)
    }

    return blogs;
}