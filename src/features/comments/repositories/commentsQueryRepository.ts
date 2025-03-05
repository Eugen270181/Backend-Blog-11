import {WithId} from "mongodb"
import {SortQueryFilterType} from "../../../common/types/sortQueryFilter.type";
import {CommentOutputModel} from "../types/output/commentOutput.model";
import {Comment, CommentModelType} from "../domain/comment.entity";
import {LikeStatus} from "../../likes/domain/like.entity";
import {LikesRepository} from "../../likes/repository/likesRepository";
import {db} from "../../../ioc";
import {DB} from "../../../common/module/db/DB";

export class CommentsQueryRepository {
    private commentModel:CommentModelType

    constructor(private db: DB,
                private likesRepository: LikesRepository) {
        this.commentModel = db.getModels().CommentModel
    }
    async findCommentById(_id: string):Promise< WithId<Comment> | null > {
        return this.commentModel.findOne({ _id , deletedAt:null}).lean().catch(() => null);
    }
    async findCommentAndMap(id: string, userId?:string):Promise< CommentOutputModel | null >{
        const comment = await this.findCommentById(id)
        return comment?this.mapComment(comment, userId):null
    }
    async getCommentsAndMap(query:SortQueryFilterType, postId?:string, userId?:string) {
        const search = postId?{postId, deletedAt:null}:{deletedAt:null}
        try {
            const comments = await this.commentModel
                .find(search)
                .sort({[query.sortBy]:query.sortDirection})
                .skip((query.pageNumber-1)*query.pageSize)
                .limit(query.pageSize)
                .lean()
            const totalCount = await this.commentModel.countDocuments(search)
            const itemsPromisses =  comments.map(el => this.mapComment(el, userId))
            const items = await Promise.all(itemsPromisses)//асинхронно, не последовательно забираем выполненые промисы
            //const items = comments.map(async (el) => {return this.mapComment(el, userId)})

            return {
                pagesCount: Math.ceil(totalCount/query.pageSize),
                page: query.pageNumber,
                pageSize:query.pageSize,
                totalCount,
                items
            }
        }
        catch(e) {
            console.log(e)
            throw new Error(JSON.stringify(e))
        }
    }
    async mapComment(comment:WithId<Comment>, userId?:string) {
        const myStatus= await this.checkMyLikeStatus(comment._id.toString(), userId)
        //console.log(`mystatus:${myStatus}:userId:${userId as string}:commentId:${comment._id.toString()}`)
        return {
            id : comment._id.toString(),
            content : comment.content,
            commentatorInfo : comment.commentatorInfo,
            createdAt : comment.createdAt.toISOString(),
            likesInfo : {
                likesCount: comment.likeCount,
                dislikesCount: comment.dislikeCount,
                myStatus
            }
        }
    }
    async checkMyLikeStatus(commentId:string, userId?:string) {
        if (!userId) return LikeStatus.None

        const myStatus = await this.likesRepository.findLikeByAuthorIdAndParentId(userId, commentId)

        return myStatus?myStatus.status:LikeStatus.None
    }
}
