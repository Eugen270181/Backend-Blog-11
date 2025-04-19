"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikesRepository = void 0;
class LikesRepository {
    db;
    likeModel;
    constructor(db) {
        this.db = db;
        this.likeModel = db.getModels().LikeModel;
    }
    async save(likeDocument) {
        await likeDocument.save();
    }
    async findLikeByAuthorIdAndParentId(authorId, parentId) {
        return this.likeModel.findOne({ authorId, parentId });
    }
}
exports.LikesRepository = LikesRepository;
//# sourceMappingURL=likesCommentsRepository.js.map