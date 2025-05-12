import {WithId} from "mongodb"
import {SortQueryFilterType} from "../../../common/types/sortQueryFilter.type";
import {pagPostOutputModel} from "../types/output/pagPostOutput.model";
import {Post, PostModelType} from "../domain/post.entity";
import {DB} from "../../../common/module/db/DB";
import {LikesPostsRepository} from "../../likes/repository/likesPostsRepository";
import {LikeStatus} from "../../../common/types/enum/likeStatus";
import {LikeDetailOutputModel} from "../../likes/types/output/extendedLikesInfoOutputModel";
import {LikePost} from "../../likes/domain/likePost.entity";
import {UsersQueryRepository} from "../../users/repositories/usersQueryRepository";



export class PostsQueryRepository {
    private postModel:PostModelType

    constructor(private db: DB,
                private likesPostsRepository: LikesPostsRepository,
                private userQueryRepository: UsersQueryRepository) {
        this.postModel = db.getModels().PostModel
    }
    async findPostById(_id: string):Promise< WithId<Post> | null > {
        return this.postModel.findOne({ _id , deletedAt:null}).lean().catch(()=> null );
    }
    async findPostAndMap(postId: string, userId?:string) {
        const post = await this.findPostById(postId)
        return post?this.mapPost(post, userId):null
    }
    async getPostsAndMap(query:SortQueryFilterType, userId?:string, blogId?:string):Promise<pagPostOutputModel> { // используем этот метод если проверили валидность и существование в бд значения blogid
        const filter = blogId?{blogId, deletedAt:null}:{deletedAt:null}
        //const search = query.searchNameTerm ? {title:{$regex:query.searchNameTerm,$options:'i'}}:{}
        try {
            const posts = await this.postModel
                .find(filter)
                .sort({[query.sortBy]:query.sortDirection})
                .skip((query.pageNumber-1)*query.pageSize)
                .limit(query.pageSize)
                .lean()
            const totalCount = await this.postModel.countDocuments(filter)
            const itemsPromisses =  posts.map(el => this.mapPost(el, userId))
            const items = await Promise.all(itemsPromisses)//асинхронно, не последовательно забираем выполненые промисы
            return {
                pagesCount: Math.ceil(totalCount/query.pageSize),
                page: query.pageNumber,
                pageSize:query.pageSize,
                totalCount,
                items
            }
        }
        catch(e){
            console.log(e)
            throw new Error(JSON.stringify(e))
        }
    }
    async mapPost(post:WithId<Post>, userId?:string) {
        const postId = post._id.toString()
        const myStatus= await this.checkMyLikeStatus(postId, userId)
        const newestLikes = await this.findPostThreeNewestLikes(postId)

        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo: {
                likesCount: post.likeCount,
                dislikesCount: post.dislikeCount,
                myStatus,
                newestLikes
            }
        }
    }
    async checkMyLikeStatus(postId:string, userId?:string) {
        if (!userId) return LikeStatus.None

        const myStatus = await this.likesPostsRepository.findLikePostByAuthorIdAndPostId(userId, postId)

        return myStatus?myStatus.status:LikeStatus.None
    }
    async findPostThreeNewestLikes(postId:string) {
        const postLikes = await this.likesPostsRepository.findThreeNewestLikesByPostId(postId)

        if (!postLikes) return []

        const mapPostLikesPromises =  postLikes.map(el => this.mapPostLike(el))

        const mapPostLikes = await Promise.all(mapPostLikesPromises)

        return mapPostLikes
    }
    async mapPostLike(el: LikePost):Promise<LikeDetailOutputModel> {
        const userId = el.authorId
        const user = await this.userQueryRepository.findUserById(userId)

        const result = {
            addedAt: el.createdAt.toISOString(),
            userId,
            login: user?user.login:null
        }

        return result
    }

}