"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsServices = void 0;
const resultStatus_1 = require("../../../common/types/enum/resultStatus");
const comment_entity_1 = require("../domain/comment.entity");
const result_class_1 = require("../../../common/classes/result.class");
class CommentsServices {
    commentsRepository;
    postsRepository;
    usersRepository;
    constructor(commentsRepository, postsRepository, usersRepository) {
        this.commentsRepository = commentsRepository;
        this.postsRepository = postsRepository;
        this.usersRepository = usersRepository;
    }
    async createComment(commentInput, postId, userId) {
        const result = new result_class_1.ResultClass();
        const { content } = commentInput;
        const foundUserDocument = await this.usersRepository.findUserById(userId);
        if (!foundUserDocument) {
            result.status = resultStatus_1.ResultStatus.Unauthorized;
            return result;
        } //401 error
        const foundPostDocument = await this.postsRepository.findPostById(postId);
        if (!foundPostDocument) {
            result.status = resultStatus_1.ResultStatus.NotFound;
            return result;
        } //404 error
        const userLogin = foundUserDocument.login;
        const newCommentDto = { content, postId, userId, userLogin };
        const newCommentDocument = comment_entity_1.Comment.createCommentDocument(newCommentDto);
        await this.commentsRepository.save(newCommentDocument);
        result.status = resultStatus_1.ResultStatus.Created;
        result.data = newCommentDocument.id;
        return result;
    }
    async deleteComment(id, userId) {
        const foundCommentDocument = await this.commentsRepository.findCommentById(id);
        if (!foundCommentDocument)
            return resultStatus_1.ResultStatus.NotFound;
        if (foundCommentDocument.commentatorInfo.userId !== userId)
            return resultStatus_1.ResultStatus.Forbidden;
        foundCommentDocument.deleteComment();
        await this.commentsRepository.save(foundCommentDocument);
        return resultStatus_1.ResultStatus.NoContent;
    }
    async updateComment(commentInput, id, userId) {
        const foundCommentDocument = await this.commentsRepository.findCommentById(id);
        if (!foundCommentDocument)
            return resultStatus_1.ResultStatus.NotFound;
        if (foundCommentDocument.commentatorInfo.userId !== userId)
            return resultStatus_1.ResultStatus.Forbidden;
        foundCommentDocument.updateComment(commentInput.content);
        await this.commentsRepository.save(foundCommentDocument);
        return resultStatus_1.ResultStatus.NoContent;
    }
}
exports.CommentsServices = CommentsServices;
//# sourceMappingURL=commentsServices.js.map