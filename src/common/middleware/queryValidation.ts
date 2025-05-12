import {query} from "express-validator";

export class QueryValidation {

    pageNumberValidation = query("pageNumber").toInt().default(1);

    pageSizeValidation = query("pageSize").toInt().default(10);

    sortByValidation = query("sortBy").default("createdAt");

    sortDirectionValidation = query("sortDirection").default("desc");

}
