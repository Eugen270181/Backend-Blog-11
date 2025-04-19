import {LikeStatus} from "../../../../common/types/enum/likeStatus";

export type LikeDetailOutputModel = {
        addedAt: string,
        userId: string | null,
        login: string | null
}

export type ExtendedLikesInfoOutputModel = {
    likesCount : Number,
    dislikesCount : Number,
    myStatus: LikeStatus,
    newestLikes: LikeDetailOutputModel[]
}