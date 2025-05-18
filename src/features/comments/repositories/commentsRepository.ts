import {CommentDocument, CommentModelType} from "../domain/comment.entity";
import {DB} from "../../../common/module/db/DB";
import {inject, injectable} from "inversify";

@injectable()
export class CommentsRepository {
    private commentModel:CommentModelType

    constructor(@inject(DB) private db: DB) {
        this.commentModel = db.getModels().CommentModel
    }

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