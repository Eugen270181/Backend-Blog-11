import {WithId} from "mongodb"
import {PostOutputModel} from "../types/output/postOutput.model";
import {SortQueryFilterType} from "../../../common/types/sortQueryFilter.type";
import {pagPostOutputModel} from "../types/output/pagPostOutput.model";
import {Post, PostModelType} from "../domain/post.entity";
import {db} from "../../../ioc";
import {DB} from "../../../common/module/db/DB";



export class PostsQueryRepository {
    private postModel:PostModelType

    constructor(private db: DB) {
        this.postModel = db.getModels().PostModel
    }
    async findPostById(_id: string):Promise< WithId<Post> | null > {
        return this.postModel.findOne({ _id , deletedAt:null}).lean().catch(()=> null );
    }
    async findPostAndMap(id: string) {
        const post = await this.findPostById(id)
        return post?this.map(post):null
    }
    async getPostsAndMap(query:SortQueryFilterType, blogId?:string):Promise<pagPostOutputModel> { // используем этот метод если проверили валидность и существование в бд значения blogid
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
            return {
                pagesCount: Math.ceil(totalCount/query.pageSize),
                page: query.pageNumber,
                pageSize:query.pageSize,
                totalCount,
                items:posts.map(this.map)
            }
        }
        catch(e){
            console.log(e)
            throw new Error(JSON.stringify(e))
        }
    }
    map(post:WithId<Post>):PostOutputModel {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
        }
    }
}