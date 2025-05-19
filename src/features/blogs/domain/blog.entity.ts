import {HydratedDocument, Model, Schema} from 'mongoose';
import {container} from "../../../composition-root";
import {DB} from "../../../common/module/db/DB";
import {TYPES} from "../../../ioc-types";


export interface IBlogDto {
    name: string,
    description: string,
    websiteUrl: string
}

export class Blog {
    name: string
    description: string
    websiteUrl: string
    createdAt: Date
    deletedAt: Date | null
    isMembership: boolean


    static createBlogDocument({name, description, websiteUrl}: IBlogDto) {
        const blog = new this()

        blog.name = name
        blog.description = description
        blog.websiteUrl = websiteUrl
        blog.createdAt = new Date()
        blog.isMembership = false
//TODO!!!!!!!!!!!
        const db = container.get<DB>(TYPES.DB)
        const blogModel = db.getModels().BlogModel

        return new blogModel(blog) as BlogDocument
    }

    deleteBlog() {
        this.deletedAt = new Date()
    }

    updateBlog({name, description, websiteUrl}: IBlogDto) {
        this.name = name
        this.description = description
        this.websiteUrl = websiteUrl
    }
}

export const blogSchema:Schema<Blog> = new Schema<Blog>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: Date, required: true },
    deletedAt: { type: Date, nullable:true, default: null },
    isMembership: { type: Boolean, required: true }
})

blogSchema.loadClass(Blog)

export type BlogModelType = Model<Blog>

export type BlogDocument = HydratedDocument<Blog>

