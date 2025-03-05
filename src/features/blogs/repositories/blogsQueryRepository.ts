import {WithId} from "mongodb"
import {BlogOutputModel} from "../types/output/blogOutput.model";
import {DB} from "../../../common/module/db/DB";
import {Pagination} from "../../../common/types/pagination.type";
import {BlogsQueryFilterType} from "../types/blogsQueryFilter.type";
import {Blog, BlogModelType} from "../domain/blog.entity";
import {BlogsRepository} from "./blogsRepository";
import {db} from "../../../ioc";


export class BlogsQueryRepository {
    private blogModel:BlogModelType

    constructor(private db: DB) {
        this.blogModel = db.getModels().BlogModel
    }
    async findBlogById(_id: string):Promise< WithId<Blog> | null > {
        return this.blogModel.findOne({ _id, deletedAt:null}).lean().catch(() => null);
    }
    async findBlogAndMap(id: string) {
        const blog = await this.findBlogById(id)
        return blog?this.map(blog):null
    }
    async getBlogsAndMap(query:BlogsQueryFilterType):Promise<Pagination<BlogOutputModel[]>> {
        const search = query.searchNameTerm ? {name:{$regex:query.searchNameTerm,$options:'i'}, deletedAt:null}:{deletedAt:null}
        try {
            const blogs = await this.blogModel
                .find(search)
                .sort({ [query.sortBy]: query.sortDirection }) // объект для сортировки
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize)
                .lean();
            const totalCount = await this.blogModel.countDocuments(search)
            return {
                pagesCount: Math.ceil(totalCount/query.pageSize),
                page: query.pageNumber,
                pageSize:query.pageSize,
                totalCount,
                items:blogs.map(this.map)
            }
        }
        catch(e){
            console.log(e)
            throw new Error(JSON.stringify(e))
        }
    }
    map(blog:WithId<Blog>):BlogOutputModel {
        return {
            id:blog._id.toString(),
            name:blog.name,
            description:blog.description,
            websiteUrl:blog.websiteUrl,
            createdAt:blog.createdAt.toISOString(),
            isMembership:blog.isMembership,
        }
    }
}
