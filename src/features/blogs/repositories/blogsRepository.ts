import {BlogDocument, BlogModelType} from "../domain/blog.entity";
import {DB} from "../../../common/module/db/DB";

export class BlogsRepository {
    private blogModel:BlogModelType

    constructor(private db: DB) {
        this.blogModel = db.getModels().BlogModel
    }

    async save(blogDocument: BlogDocument):Promise<void> {
        await blogDocument.save();
    }
    async findBlogById(id: string):Promise< BlogDocument | null > {
        return this.blogModel.findOne({ _id: id , deletedAt: null }).catch(()=> null )
    }
}


