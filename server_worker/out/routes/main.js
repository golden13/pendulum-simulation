"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRouter = void 0;
const express_1 = __importDefault(require("express"));
const default_config_1 = require("../data/default_config");
const router = express_1.default.Router();
exports.mainRouter = router;
// Basic metrics endpoint
router.get('/metrics', (req, res) => {
    let data = default_config_1.defaultItemsConfig;
    let arr = [];
    data.forEach(item => {
        arr.push(item);
    });
    return res.json(arr);
});
//# sourceMappingURL=main.js.map