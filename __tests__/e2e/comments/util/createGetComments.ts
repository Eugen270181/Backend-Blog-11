const request = require("supertest");
//import request from 'supertest'

import {routersPaths} from "../../../../src/common/settings/paths";
import {CommentDto} from "../../testingDtosCreator";
import {CommentOutputModel} from "../../../../src/features/comments/types/output/commentOutput.model";
import {Pagination} from "../../../../src/common/types/pagination.type";


export const createPostComment = async (app: any, acessToken:string, postId:string, dto: CommentDto ):Promise<CommentOutputModel> => {

    const resp = await request(app)
        .post(`${routersPaths.posts}/${postId}${routersPaths.comments}`)
        .set('Authorization',`bearer ${acessToken}`)
        .send(dto)
        .expect(201)

    return resp.body
}
export const createPostComments = async (app: any, acessToken:string, postId:string, dtos: CommentDto[] ):Promise<CommentOutputModel[]> => {
    const comments:CommentOutputModel[]=[]

    for (let i = 0; i < dtos.length; i++) {
        const comment = await createPostComment(app, acessToken, postId, dtos[i])
        comments.push(comment)
    }

    return comments
}

export const getPostComments = async (app: any, postId: string):Promise<Pagination<CommentOutputModel>> => {

    const resp = await request(app)
        .get(`${routersPaths.posts}/${postId}/comments`)
        .expect(200)

    return resp.body
}

export const getCommentById = async (app: any, commentId: string, acessToken?: string):Promise<CommentOutputModel> => {

    const resp = await request(app)
        .get(`${routersPaths.comments}/${commentId}`)
        .set('Authorization',acessToken?`bearer ${acessToken}`:``)
        .expect(200)

    return resp.body
}





