import {PostDocument, PostModelType} from "../domain/post.entity";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class PostsRepository {

    constructor(@inject(TYPES.PostModel) private postModel: PostModelType
    ) {}
    async save(post: PostDocument): Promise<void> {
        await post.save()
    }
    async findPostById(_id: string):Promise< PostDocument | null > {
        return this.postModel.findOne({ _id , deletedAt:null}).catch(()=> null )
    }
    async increaseLikeCounter(_id: string){
        await this.postModel.updateOne( { _id , deletedAt:null}, { $inc: { likeCount: 1 } } )
    }
    async decreaseLikeCounter(_id: string){
        await this.postModel.updateOne( { _id , deletedAt:null}, { $inc: { likeCount: -1 } } )
    }
    async increaseDislikeCounter(_id: string){
        await this.postModel.updateOne( { _id , deletedAt:null}, { $inc: { dislikeCount: 1 } } )
    }
    async decreaseDislikeCounter(_id: string){
        await this.postModel.updateOne( { _id , deletedAt:null}, { $inc: { dislikeCount: -1 } } )
    }

}