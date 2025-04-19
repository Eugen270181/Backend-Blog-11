"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingRouter = void 0;
const express_1 = require("express");
const clearDBTestingController_1 = require("./controllers/clearDBTestingController");
const paths_1 = require("../../common/settings/paths");
//import {adminMiddleware} from "../../common/middleware/admin-middleware"
exports.testingRouter = (0, express_1.Router)();
//testingRouter.use(adminMiddleware)
exports.testingRouter.delete(paths_1.routersPaths.inTesting, clearDBTestingController_1.clearDBTestingController);
//# sourceMappingURL=testing.router.js.map