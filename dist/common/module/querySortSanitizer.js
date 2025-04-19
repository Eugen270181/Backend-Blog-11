"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySortSanitizer = void 0;
const querySortSanitizer = (query) => {
    const pageNumber = !isNaN(Number(query.pageNumber))
        ? Number(query.pageNumber)
        : 1;
    const pageSize = !isNaN(Number(query.pageSize))
        ? Number(query.pageSize)
        : 10;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortDirection = query.sortDirection === "asc" ? 1 : -1;
    return {
        pageNumber,
        pageSize,
        sortDirection,
        sortBy,
    };
};
exports.querySortSanitizer = querySortSanitizer;
//# sourceMappingURL=querySortSanitizer.js.map