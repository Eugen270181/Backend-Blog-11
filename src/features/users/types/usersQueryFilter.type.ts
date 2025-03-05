import {SortQueryFilterType} from "../../../common/types/sortQueryFilter.type";


export type UsersQueryFilterType = {
    searchLoginTerm?: string,
    searchEmailTerm?: string
} & SortQueryFilterType