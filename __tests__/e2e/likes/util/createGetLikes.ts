const request = require("supertest");
//import request from 'supertest'

import {routersPaths} from "../../../../src/common/settings/paths";
import {LikeDto} from "../../testingDtosCreator";
import {LikeStatus} from "../../../../src/common/types/enum/likeStatus";
import {CommentOutputModel} from "../../../../src/features/comments/types/output/commentOutput.model";
import {PostOutputModel} from "../../../../src/features/posts/types/output/postOutput.model";
import {LikeDetailOutputModel} from "../../../../src/features/likes/types/output/extendedLikesInfoOutputModel";

export const createPostLike = async (app: any, acessToken:string, postId:string, dto: LikeDto ) => {
    await request(app)
        .put(`${routersPaths.posts}/${postId}/like-status`)
        .set('Authorization',`bearer ${acessToken}`)
        .send(dto)
        .expect(204)
}

export const createCommentLike = async (app: any, acessToken:string, commentId:string, dto: LikeDto ) => {
    await request(app)
        .put(`${routersPaths.comments}/${commentId}/like-status`)
        .set('Authorization',`bearer ${acessToken}`)
        .send(dto)
        .expect(204)
}

export const checkPostLikeData = ( post: PostOutputModel,
                               expLikes?: number,
                               expDislikes?: number,
                               expMyStatus?: LikeStatus,
                               expArrLikes?: Array<Omit<LikeDetailOutputModel, 'addedAt'>> ) => {
        // Проверка likesCount
        if (expLikes !== undefined) {
            expect(post.extendedLikesInfo.likesCount).toBe(expLikes);
        }
        // Проверка dislikesCount
        if (expDislikes !== undefined) {
            expect(post.extendedLikesInfo.dislikesCount).toBe(expDislikes);
        }
        // Проверка myStatus
        if (expMyStatus !== undefined) {
            expect(post.extendedLikesInfo.myStatus).toBe(expMyStatus);
        }
        // Проверка массива newestLikes
        if (expArrLikes !== undefined) {
            if (expArrLikes.length===0) {
                expect(post.extendedLikesInfo.newestLikes).toEqual(expArrLikes)
            } else {
                expect(post.extendedLikesInfo.newestLikes).toEqual(expect.arrayContaining([
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?$/),
                        userId: expect.any(String),
                        login: expect.any(String),
                    }
                ]));

                const arr3Likes = post.extendedLikesInfo.newestLikes
                const arr3LikesCount = arr3Likes.length

                expect(arr3LikesCount).toBe(expArrLikes.length)
                for (let i = 0; i < arr3LikesCount; i++) {
                     expect(arr3Likes[i].userId).toBe(expArrLikes[i].userId)
                     expect(arr3Likes[i].login).toBe(expArrLikes[i].login)
                }
            }
        }
}

export const checkCommentLikeData = ( comment: CommentOutputModel,
                                   expLikes?: number,
                                   expDislikes?: number,
                                   expMyStatus?: LikeStatus,
                                   ) => {
    // Проверка likesCount
    if (expLikes !== undefined) {
        expect(comment.likesInfo.likesCount).toBe(expLikes);
    }
    // Проверка dislikesCount
    if (expDislikes !== undefined) {
        expect(comment.likesInfo.dislikesCount).toBe(expDislikes);
    }
    // Проверка myStatus
    if (expMyStatus !== undefined) {
        expect(comment.likesInfo.myStatus).toBe(expMyStatus);
    }

}
