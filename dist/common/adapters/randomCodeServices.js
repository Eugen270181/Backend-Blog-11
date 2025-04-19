"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomCodeServices = void 0;
const crypto_1 = require("crypto");
exports.RandomCodeServices = {
    genRandomCode() {
        const code = (0, crypto_1.randomUUID)();
        console.log(this);
        return code;
    }
};
//# sourceMappingURL=randomCodeServices.js.map