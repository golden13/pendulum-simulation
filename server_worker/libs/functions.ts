import { onePendulum } from "..";
import { IPendulumElem } from "../classes/pendulum";
import { MPID, defaultItemsConfig } from "../data/default_config";

// some functions
/**
 * Update pendulum object settings base on received data
 * @param data 
 */
export function updatePendulumSettings(data: IPendulumElem) {
    // update
    defaultItemsConfig.set(MPID, data);

    // update current pendulum props
    onePendulum.props = data;
    
    // do stop to reinit all settings
    onePendulum.stop();

    //console.log('Pendulum New Data: ', onePendulum.props);
}

/**
 * Update initial settings, when server starts it receive initial pendulum data
 * @param data 
 */
export function updateDefaultSettings(data: IPendulumElem[]) {
    // update
    console.log('Updating default settings...');
    //console.log('Data: ', data);
    defaultItemsConfig.clear();
    data.forEach((item) => {
        defaultItemsConfig.set(item.id, item);
    });
}
