import {CommentsRepository} from "../repositories/commentsRepository";
import {CreateCommentInputModel} from "../types/input/createCommentInput.model";
import {UpdateCommentInputModel} from "../types/input/updateCommentInput.model";
import {UsersRepository} from "../../users/repositories/usersRepository";
import {ResultStatus} from "../../../common/types/enum/resultStatus";
import {Comment, CommentDocument, ICommentDto} from "../domain/comment.entity";
import {PostsRepository} from "../../posts/repositories/postsRepository";
import {Result} from "../../../common/classes/result";



export class CommentsServices {
    constructor(private commentsRepository: CommentsRepository,
                private postsRepository: PostsRepository,
                private usersRepository: UsersRepository) {}
    async createComment(commentInput: CreateCommentInputModel, postId:string, userId:string) {
        const result = new Result<string>()
        const {content} = commentInput

        const foundUserDocument= await this.usersRepository.findUserById(userId)
        if (!foundUserDocument) {result.status = ResultStatus.Unauthorized; return result}//401 error
        const foundPostDocument= await this.postsRepository.findPostById(postId)
        if (!foundPostDocument) {result.status = ResultStatus.NotFound; return result}//404 error

        const userLogin = foundUserDocument.login

        const newCommentDto:ICommentDto = { content, postId, userId, userLogin }
        const newCommentDocument:CommentDocument = Comment.createCommentDocument(newCommentDto)

        await this.commentsRepository.save(newCommentDocument)

        result.status = ResultStatus.Created
        result.data = newCommentDocument.id
        return result
    }
    async deleteComment(id:string, userId:string){
        const foundCommentDocument=await this.commentsRepository.findCommentById(id)
        if (!foundCommentDocument) return ResultStatus.NotFound

        if (foundCommentDocument.commentatorInfo.userId!==userId) return ResultStatus.Forbidden

        foundCommentDocument.deleteComment()

        await this.commentsRepository.save(foundCommentDocument)

        return ResultStatus.NoContent
    }
    async updateComment(commentInput: UpdateCommentInputModel, id: string, userId:string) {
        const foundCommentDocument=await this.commentsRepository.findCommentById(id)
        if (!foundCommentDocument) return ResultStatus.NotFound

        if (foundCommentDocument.commentatorInfo.userId!==userId) return ResultStatus.Forbidden

        foundCommentDocument.updateComment(commentInput.content);

        await this.commentsRepository.save(foundCommentDocument)

        return ResultStatus.NoContent
    }
}