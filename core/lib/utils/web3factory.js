"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeb3 = void 0;
const tslib_1 = require("tslib");
const web3_1 = tslib_1.__importDefault(require("web3"));
function getWeb3(rpcUrl) {
    return new web3_1.default(rpcUrl);
}
exports.getWeb3 = getWeb3;
//# sourceMappingURL=web3factory.js.map