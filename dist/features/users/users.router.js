"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const adminMiddleware_1 = require("../../common/middleware/adminMiddleware");
const cerateUserOrRegValidatonMiddleware_1 = require("../../common/middleware/cerateUserOrRegValidatonMiddleware");
const ioc_1 = require("../../ioc");
const users_controller_1 = require("./controllers/users.controller");
exports.usersRouter = (0, express_1.Router)();
const usersControllerInstance = ioc_1.ioc.getInstance(users_controller_1.UsersController);
exports.usersRouter.get('/', adminMiddleware_1.adminMiddleware, usersControllerInstance.getUsersController.bind(usersControllerInstance));
exports.usersRouter.post('/', adminMiddleware_1.adminMiddleware, ...cerateUserOrRegValidatonMiddleware_1.createUserValidators, usersControllerInstance.createUserController.bind(usersControllerInstance));
exports.usersRouter.delete('/:id', adminMiddleware_1.adminMiddleware, usersControllerInstance.delUserController.bind(usersControllerInstance));
//# sourceMappingURL=users.router.js.map