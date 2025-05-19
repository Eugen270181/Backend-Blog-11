import {BlogDocument, BlogModelType} from "../domain/blog.entity";
import {DB} from "../../../common/module/db/DB";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../ioc-types";

@injectable()
export class BlogsRepository {
    private blogModel:BlogModelType
//TODO
    constructor(@inject(TYPES.DB) private db: DB) {
        this.blogModel = db.getModels().BlogModel
    }

    async save(blogDocument: BlogDocument):Promise<void> {
        await blogDocument.save();
    }
    async findBlogById(_id: string):Promise< BlogDocument | null > {
        return this.blogModel.findOne({ _id, deletedAt: null }).catch(()=> null )
    }
}


