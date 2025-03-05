import {PostDocument, PostModelType} from "../domain/post.entity";
import {db} from "../../../ioc";
import {DB} from "../../../common/module/db/DB";


export class PostsRepository {
    private postModel:PostModelType

    constructor(private db: DB) {
        this.postModel = db.getModels().PostModel
    }
    async save(post: PostDocument): Promise<void> {
        await post.save()
    }
    async findPostById(id: string):Promise< PostDocument | null > {
        return this.postModel.findOne({ _id: id , deletedAt:null}).catch(()=> null )
    }
}