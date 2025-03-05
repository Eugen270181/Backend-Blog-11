import {HydratedDocument, Model, Schema} from "mongoose";

import {db} from "../../../ioc";


export interface ILikeDto {
    authorId: string
    parentId: string
    status: LikeStatus
}

export enum LikeStatus {
    None = "None",
    Like = "Like",
    Dislike = "Dislike"
}

export class Like {
    authorId: string
    parentId: string
    status: LikeStatus
    createdAt: Date

    static createLikeDocument({authorId, parentId, status}: ILikeDto) {
        const like = new this()

        like.authorId = authorId
        like.parentId = parentId
        like.status = status
        like.createdAt = new Date()

        const likeModel = db.getModels().LikeModel

        return new likeModel(like) as LikeDocument
    }

    updateLike(newStatus:LikeStatus) {
        this.status = newStatus
    }
}

export const likeSchema = new Schema<Like>({
        createdAt: {type: Date, required: true},
        status: {type: String, enum: LikeStatus, required: true, default: LikeStatus.None},
        authorId: {type: String, required: true},
        parentId: {type: String, required: true},
})

likeSchema.loadClass(Like)

export type LikeModelType = Model<Like>

export type LikeDocument = HydratedDocument<Like>