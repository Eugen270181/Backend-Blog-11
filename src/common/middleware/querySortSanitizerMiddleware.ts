import {query} from "express-validator";

export const pageNumberValidation = query("pageNumber").toInt().default(1);
export const pageSizeValidation = query("pageSize").toInt().default(10);
export const sortByValidation = query("sortBy").default("createdAt");
export const sortDirectionValidation = query("sortDirection").default("desc");




export const querySortSanitizers = [
    pageNumberValidation,
    pageSizeValidation,
    sortByValidation,
    sortDirectionValidation
]