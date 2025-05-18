import {LikeCommentDocument, LikeCommentModelType} from "../domain/likeComment.entity";

import {DB} from "../../../common/module/db/DB";
import {inject, injectable} from "inversify";

@injectable()
export class LikesCommentsRepository {
    private likeCommentModel:LikeCommentModelType

    constructor(@inject(DB) private db: DB) {
        this.likeCommentModel = db.getModels().LikeCommentModel
    }

    async save(likeCommentDocument: LikeCommentDocument):Promise<void> {
        await likeCommentDocument.save();
    }
    async findLikeCommentByAuthorIdAndCommentId(authorId: string, commentId:string):Promise< LikeCommentDocument | null > {
        return this.likeCommentModel.findOne({ authorId , commentId })
    }
}