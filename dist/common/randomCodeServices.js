"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generate = void 0;
const crypto_1 = require("crypto");
exports.Generate = {
    code() {
        return (0, crypto_1.randomUUID)();
    }
};
//# sourceMappingURL=randomCodeServices.js.map