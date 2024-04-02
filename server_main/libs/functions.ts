import { IPendulumElem } from "../classes/pendulum";
import { currentItems } from "../data/default_config";

// Some basic functions

/**
 *  Update one Pendulum settings
 * @param data
 */
export function updatePendulumSettings(data: IPendulumElem) {
    currentItems.set(data.id, data);
}

/**
 * Update all Pendulum settings
 * @param data 
 */
export function updateDefaultSettings(data: IPendulumElem[]) {
    //console.log('Updating default settings...');
    currentItems.clear();
    data.forEach((item) => {
        currentItems.set(item.id, item);
    });
}

let lastItemUpdate = new Map<string, {time: number, count: number}>();

export function getFPS(item: IPendulumElem) {
    let seconds = Math.round(new Date().getTime() / 1000);
    //console.log('seconds: ', seconds);
    // get last update for pendulum item
    let obj = lastItemUpdate.get(item.id);
    let res = {time: 0, count: 0};
    //console.log('obj:', obj);
    if (obj) {
        if (seconds > obj.time) {
            res = {time: obj.time, count: obj.count};
            lastItemUpdate.set(item.id, {time: seconds, count: 1}); // set new value
        } else {
            res = {time: obj.time, count: (obj.count + 1)};
            lastItemUpdate.set(item.id, res); // increment old value
        }
    } else {
        res = {time: seconds, count: 1};
        lastItemUpdate.set(item.id, res); // set new value
    }

    return res;
}