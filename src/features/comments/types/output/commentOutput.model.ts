import {CommentatorInfo} from "../../domain/comment.entity";
import {LikesInfoOutputModel} from "../../../likes/types/output/likesInfoOutputModel";


export type CommentOutputModel = {
    id:string
    content: string
    commentatorInfo: CommentatorInfo
    createdAt: string
    likesInfo: LikesInfoOutputModel
}