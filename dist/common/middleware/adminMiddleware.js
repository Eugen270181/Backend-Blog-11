"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.ADMIN_TOKEN = exports.ADMIN_PASS = exports.ADMIN_LOGIN = void 0;
exports.ADMIN_LOGIN = "admin";
exports.ADMIN_PASS = "qwerty";
exports.ADMIN_TOKEN = 'Basic ' + Buffer.from(`${exports.ADMIN_LOGIN}:${exports.ADMIN_PASS}`).toString('base64');
const adminMiddleware = (req, res, next) => {
    if (req.headers.authorization !== exports.ADMIN_TOKEN)
        return res.sendStatus(401);
    return next();
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=adminMiddleware.js.map