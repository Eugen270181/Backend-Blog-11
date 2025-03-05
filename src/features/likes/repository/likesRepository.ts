import {LikeDocument, LikeModelType} from "../domain/like.entity";

import {DB} from "../../../common/module/db/DB";


export class LikesRepository {
    private likeModel:LikeModelType

    constructor(private db: DB) {
        this.likeModel = db.getModels().LikeModel
    }

    async save(likeDocument: LikeDocument):Promise<void> {
        await likeDocument.save();
    }
    async findLikeByAuthorIdAndParentId(authorId: string, parentId:string):Promise< LikeDocument | null > {
        return this.likeModel.findOne({ authorId , parentId })
    }
}