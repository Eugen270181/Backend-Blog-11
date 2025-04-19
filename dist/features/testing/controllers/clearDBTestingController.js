"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDBTestingController = void 0;
const httpStatus_1 = require("../../../common/types/enum/httpStatus");
const ioc_1 = require("../../../ioc");
const clearDBTestingController = async (req, res) => {
    await ioc_1.db.drop();
    res.sendStatus(httpStatus_1.HttpStatus.NoContent);
};
exports.clearDBTestingController = clearDBTestingController;
//# sourceMappingURL=clearDBTestingController.js.map