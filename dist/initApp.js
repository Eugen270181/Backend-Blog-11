"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_router_1 = require("./features/auth/auth.router");
const users_router_1 = require("./features/users/users.router");
const blogs_router_1 = require("./features/blogs/blogs.router");
const testing_router_1 = require("./features/testing/testing.router");
const posts_router_1 = require("./features/posts/posts.router");
const comments_router_1 = require("./features/comments/comments.router");
const paths_1 = require("./common/settings/paths");
const security_router_1 = require("./features/security/security.router");
const initApp = () => {
    const app = (0, express_1.default)(); // создать приложение
    app.use((0, cors_1.default)()); // разрешить любым фронтам делать запросы на наш бэк
    app.set('trust proxy', true); //доверять прокси-серверам при определении IP-адреса клиента и другой информации из заголовков запроса
    app.use(express_1.default.json()); // создание свойств-объектов body и query во всех реквестах
    app.use((0, cookie_parser_1.default)()); // создание свойств-объектов cookies во всех реквестах
    app.use(paths_1.routersPaths.auth, auth_router_1.authRouter);
    app.use(paths_1.routersPaths.users, users_router_1.usersRouter);
    app.use(paths_1.routersPaths.blogs, blogs_router_1.blogsRouter);
    app.use(paths_1.routersPaths.posts, posts_router_1.postsRouter);
    app.use(paths_1.routersPaths.comments, comments_router_1.commentsRouter);
    app.use(paths_1.routersPaths.testing, testing_router_1.testingRouter);
    app.use(paths_1.routersPaths.security, security_router_1.securityRouter);
    return app;
};
exports.initApp = initApp;
//# sourceMappingURL=initApp.js.map