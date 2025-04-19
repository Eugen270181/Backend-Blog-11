import {LikeStatus} from "../../../common/types/enum/likeStatus";
import {db} from "../../../ioc";
import {HydratedDocument, Model, Schema} from "mongoose";


export interface ILikePostDto {
    authorId: string
    postId: string
    status: LikeStatus
}

export class LikePost {
    authorId: string
    postId: string
    status: LikeStatus
    createdAt: Date

    static createLikePostDocument({authorId, postId, status}: ILikePostDto) {
        const likePost = new this()

        likePost.authorId = authorId
        likePost.postId = postId
        likePost.status = status
        likePost.createdAt = new Date()

        const likePostModel = db.getModels().LikePostModel

        return new likePostModel(likePost) as LikePostDocument
    }

    updateLikePost(newStatus:LikeStatus) {
        this.status = newStatus
    }
}

export const likePostSchema = new Schema<LikePost>({
        createdAt: {type: Date, required: true},
        status: {type: String, enum: LikeStatus, required: true, default: LikeStatus.None},
        authorId: {type: String, required: true},
        postId: {type: String, required: true},
})

likePostSchema.loadClass(LikePost)

export type LikePostModelType = Model<LikePost>

export type LikePostDocument = HydratedDocument<LikePost>