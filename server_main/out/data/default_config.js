"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetCurrentItems = exports.currentItems = exports.defaultItemsConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Default pendulum settings.
// All workers and main server have the same config.
// Basically it should be moved somewhere else and loaded on server start
const defItems = [
    {
        type: 'pendulum',
        name: 'P1',
        id: '1',
        fill_color: 'orange',
        ball_radius: 20.0,
        ball_position: { x: 82, y: 254 },
        rope_start_position: { x: 200, y: 30 },
        rope_length: 190,
        angle: -4,
        angular_velocity: 100.0,
        angular_speed: 60.0,
        damping: 4, //0.995,
        gravity: { x: 1, y: 0, scale: 0 },
        ball_mass: 300,
        friction_air: 1,
        server_port: 8081,
        fps: 0,
    },
    {
        type: 'pendulum',
        name: 'P2',
        id: '2',
        fill_color: 'blue',
        ball_radius: 10.0,
        ball_position: { x: 343, y: 221 },
        rope_start_position: { x: 300, y: 30 },
        rope_length: 300,
        angle: 7,
        angular_velocity: 0.0,
        angular_speed: 0.0,
        damping: 0.995,
        gravity: { x: 1, y: 0, scale: 0 },
        ball_mass: 3,
        friction_air: 0,
        server_port: 8082,
        fps: 0,
    },
    {
        type: 'pendulum',
        name: 'P3',
        id: '3',
        fill_color: 'black',
        ball_radius: 30.0,
        ball_position: { x: 375, y: 138 },
        rope_start_position: { x: 400, y: 30 },
        rope_length: 100,
        angle: 8,
        angular_velocity: 0.0,
        angular_speed: 0.0,
        damping: 0.995,
        gravity: { x: 1, y: 0, scale: 0 },
        ball_mass: 3,
        friction_air: 0,
        server_port: 8083,
        fps: 0,
    },
    {
        type: 'pendulum',
        name: 'P4',
        id: '4',
        fill_color: 'green',
        ball_radius: 50.0,
        ball_position: { x: 706, y: 301 },
        rope_start_position: { x: 500, y: 30 },
        rope_length: 250,
        angle: 9,
        angular_velocity: 0.0,
        angular_speed: 0.0,
        damping: 0.995,
        gravity: { x: 1, y: 0, scale: 0 },
        ball_mass: 3,
        friction_air: 0,
        server_port: 8084,
        fps: 0,
    },
    {
        type: 'pendulum',
        name: 'P5',
        id: '5',
        fill_color: 'violet',
        ball_radius: 21.0,
        ball_position: { x: 644, y: 123 },
        rope_start_position: { x: 820, y: 30 },
        rope_length: 400,
        angle: 12,
        angular_velocity: 0.0,
        angular_speed: 0.0,
        damping: 0.995,
        gravity: { x: 1, y: 0, scale: 0 },
        ball_mass: 3,
        friction_air: 0,
        server_port: 8085,
        fps: 0,
    },
];
// default items
exports.defaultItemsConfig = new Map();
exports.defaultItemsConfig.set(defItems[0]['id'], defItems[0]);
exports.defaultItemsConfig.set(defItems[1]['id'], defItems[1]);
exports.defaultItemsConfig.set(defItems[2]['id'], defItems[2]);
exports.defaultItemsConfig.set(defItems[3]['id'], defItems[3]);
exports.defaultItemsConfig.set(defItems[4]['id'], defItems[4]);
// changed items
exports.currentItems = initCurrentItems();
function resetCurrentItems() {
    exports.currentItems = initCurrentItems();
}
exports.resetCurrentItems = resetCurrentItems;
function initCurrentItems() {
    let items = new Map();
    // copy values
    exports.defaultItemsConfig.forEach((item) => {
        items.set(item.id, item);
    });
    return items;
}
//# sourceMappingURL=default_config.js.map