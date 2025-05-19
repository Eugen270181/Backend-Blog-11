import {HydratedDocument, Model, Schema} from "mongoose";
import {LikeStatus} from "../../../common/types/enum/likeStatus";
import {container} from "../../../composition-root";
import {DB} from "../../../common/module/db/DB";
import {TYPES} from "../../../ioc-types";


export interface ILikeCommentDto {
    authorId: string
    commentId: string
    status: LikeStatus
}

export class LikeComment {
    authorId: string
    commentId: string
    status: LikeStatus
    createdAt: Date

    static createLikeCommentDocument({authorId, commentId, status}: ILikeCommentDto) {
        const likeComment = new this()

        likeComment.authorId = authorId
        likeComment.commentId = commentId
        likeComment.status = status
        likeComment.createdAt = new Date()

        const db = container.get<DB>(TYPES.DB)
        const likeCommentModel = db.getModels().LikeCommentModel

        return new likeCommentModel(likeComment) as LikeCommentDocument
    }

    updateLikeComment(newStatus:LikeStatus) {
        this.status = newStatus
    }
}

export const likeCommentSchema = new Schema<LikeComment>({
        createdAt: {type: Date, required: true},
        status: {type: String, enum: LikeStatus, required: true, default: LikeStatus.None},
        authorId: {type: String, required: true},
        commentId: {type: String, required: true},
})

likeCommentSchema.loadClass(LikeComment)

export type LikeCommentModelType = Model<LikeComment>

export type LikeCommentDocument = HydratedDocument<LikeComment>