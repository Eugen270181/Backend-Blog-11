"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityRouter = void 0;
const express_1 = require("express");
const paths_1 = require("../../common/settings/paths");
const ioc_1 = require("../../ioc");
const security_controller_1 = require("./controllers/security.controller");
exports.securityRouter = (0, express_1.Router)();
const securityControllerInstance = ioc_1.ioc.getInstance(security_controller_1.SecurityController);
exports.securityRouter.get(paths_1.routersPaths.inSecurity, securityControllerInstance.getSecurityDevicesController.bind(securityControllerInstance));
exports.securityRouter.delete(paths_1.routersPaths.inSecurity, securityControllerInstance.delSecurityDevicesController.bind(securityControllerInstance));
exports.securityRouter.delete(paths_1.routersPaths.inSecurity + '/:id', securityControllerInstance.delSecurityDeviceController.bind(securityControllerInstance));
//# sourceMappingURL=security.router.js.map