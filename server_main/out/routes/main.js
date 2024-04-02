"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRouter = void 0;
const express_1 = __importDefault(require("express"));
const default_config_1 = require("../data/default_config");
const __1 = require("..");
const functions_1 = require("../libs/functions");
// Routes for HTTP REST API
const router = express_1.default.Router();
exports.mainRouter = router;
// Get settings
router.get('/settings', (req, res) => {
    console.log('REST: Request to send settings received');
    let data = default_config_1.currentItems;
    let arr = [];
    data.forEach(item => {
        arr.push(item);
    });
    return res.json(arr);
});
// Update settings
router.post('/settings', (req, res) => {
    try {
        const data = req.body;
        console.log('REST: Received new settings');
        //console.log('Received new settings', data);
        (0, functions_1.updatePendulumSettings)(data);
        console.log('Sending "update_settings" message to other nodes...');
        // send broadcast message to backend clients to update their settings
        __1.io.sockets.emit('update_settings', data);
        return res.json(data);
    }
    catch (err) {
        console.error(err);
    }
});
//# sourceMappingURL=main.js.map