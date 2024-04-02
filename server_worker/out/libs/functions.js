"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDefaultSettings = exports.updatePendulumSettings = void 0;
const __1 = require("..");
const default_config_1 = require("../data/default_config");
// some functions
/**
 * Update pendulum object settings base on received data
 * @param data
 */
function updatePendulumSettings(data) {
    // update
    default_config_1.defaultItemsConfig.set(default_config_1.MPID, data);
    // update current pendulum props
    __1.onePendulum.props = data;
    // do stop to reinit all settings
    __1.onePendulum.stop();
    //console.log('Pendulum New Data: ', onePendulum.props);
}
exports.updatePendulumSettings = updatePendulumSettings;
/**
 * Update initial settings, when server starts it receive initial pendulum data
 * @param data
 */
function updateDefaultSettings(data) {
    // update
    console.log('Updating default settings...');
    //console.log('Data: ', data);
    default_config_1.defaultItemsConfig.clear();
    data.forEach((item) => {
        default_config_1.defaultItemsConfig.set(item.id, item);
    });
}
exports.updateDefaultSettings = updateDefaultSettings;
//# sourceMappingURL=functions.js.map