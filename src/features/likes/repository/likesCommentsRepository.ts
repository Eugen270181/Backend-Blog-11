import {LikeCommentDocument, LikeCommentModelType} from "../domain/likeComment.entity";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class LikesCommentsRepository {

    constructor(@inject(TYPES.LikeCommentModel) private likeCommentModel: LikeCommentModelType
    ) {}

    async save(likeCommentDocument: LikeCommentDocument):Promise<void> {
        await likeCommentDocument.save();
    }
    async findLikeCommentByAuthorIdAndCommentId(authorId: string, commentId:string):Promise< LikeCommentDocument | null > {
        return this.likeCommentModel.findOne({ authorId , commentId })
    }
}