"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFPS = exports.updateDefaultSettings = exports.updatePendulumSettings = void 0;
const default_config_1 = require("../data/default_config");
// Some basic functions
/**
 *  Update one Pendulum settings
 * @param data
 */
function updatePendulumSettings(data) {
    default_config_1.currentItems.set(data.id, data);
}
exports.updatePendulumSettings = updatePendulumSettings;
/**
 * Update all Pendulum settings
 * @param data
 */
function updateDefaultSettings(data) {
    //console.log('Updating default settings...');
    default_config_1.currentItems.clear();
    data.forEach((item) => {
        default_config_1.currentItems.set(item.id, item);
    });
}
exports.updateDefaultSettings = updateDefaultSettings;
let lastItemUpdate = new Map();
function getFPS(item) {
    let seconds = Math.round(new Date().getTime() / 1000);
    //console.log('seconds: ', seconds);
    // get last update for pendulum item
    let obj = lastItemUpdate.get(item.id);
    let res = { time: 0, count: 0 };
    //console.log('obj:', obj);
    if (obj) {
        if (seconds > obj.time) {
            res = { time: obj.time, count: obj.count };
            lastItemUpdate.set(item.id, { time: seconds, count: 1 }); // set new value
        }
        else {
            res = { time: obj.time, count: (obj.count + 1) };
            lastItemUpdate.set(item.id, res); // increment old value
        }
    }
    else {
        res = { time: seconds, count: 1 };
        lastItemUpdate.set(item.id, res); // set new value
    }
    return res;
}
exports.getFPS = getFPS;
//# sourceMappingURL=functions.js.map