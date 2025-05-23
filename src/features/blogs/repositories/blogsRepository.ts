import {BlogDocument, BlogModelType} from "../domain/blog.entity";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class BlogsRepository {

    constructor(@inject(TYPES.BlogModel) private blogModel: BlogModelType) { }

    async save(blogDocument: BlogDocument):Promise<void> {
        await blogDocument.save();
    }
    async findBlogById(_id: string):Promise< BlogDocument | null > {
        return this.blogModel.findOne({ _id, deletedAt: null }).catch(()=> null )
    }
}


