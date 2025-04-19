import {LikeCommentDocument, LikeCommentModelType} from "../domain/likeComment.entity";

import {DB} from "../../../common/module/db/DB";
import {LikePost, LikePostDocument, LikePostModelType} from "../domain/likePost.entity";


export class LikesPostsRepository {

    private likePostModel:LikePostModelType

    constructor(private db: DB) {
        this.likePostModel = db.getModels().LikePostModel
    }

    async save(likePostDocument: LikePostDocument):Promise<void> {
        await likePostDocument.save();
    }
    async findLikePostByAuthorIdAndPostId(authorId: string, postId:string):Promise< LikePostDocument | null > {
        return this.likePostModel.findOne({ authorId , postId })
    }

    async findLikePostByAuthorIdAndPostIdOrThrow(authorId: string, postId:string) {
        const likePostDocument = await this.findLikePostByAuthorIdAndPostId(authorId, postId);

        if (!likePostDocument) {
            throw new Error('not found');
        }

        return likePostDocument;
    }
    async findThreeNewestLikesByPostId(postId:string):Promise< LikePost[] | null > {

        return this.likePostModel
                .find( {postId, deletedAt:null} )
                .sort({ createdAt: -1 })
                .limit(3)
                .lean()
    }
}