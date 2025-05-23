import {CommentDocument, CommentModelType} from "../domain/comment.entity";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class CommentsRepository {

    constructor(@inject(TYPES.CommentModel) private commentModel:CommentModelType
    ) {}

    async save(commentDocument: CommentDocument):Promise<void> {
        await commentDocument.save()
    }
    async findCommentById(_id: string):Promise< CommentDocument | null > {
        return this.commentModel.findOne({ _id , deletedAt:null}).catch(()=> null )
    }
    async increaseLikeCounter(_id: string){
        await this.commentModel.updateOne( { _id , deletedAt:null}, { $inc: { likeCount: 1 } } )
    }
    async decreaseLikeCounter(_id: string){
        await this.commentModel.updateOne( { _id , deletedAt:null}, { $inc: { likeCount: -1 } } )
    }
    async increaseDislikeCounter(_id: string){
        await this.commentModel.updateOne( { _id , deletedAt:null}, { $inc: { dislikeCount: 1 } } )
    }
    async decreaseDislikeCounter(_id: string){
        await this.commentModel.updateOne( { _id , deletedAt:null}, { $inc: { dislikeCount: -1 } } )
    }

}