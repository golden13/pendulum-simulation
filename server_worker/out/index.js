"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onePendulum = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mqtt_1 = require("./libs/mqtt");
const ioclient = __importStar(require("socket.io-client"));
const cors_1 = __importDefault(require("cors"));
const matter_js_1 = __importDefault(require("matter-js"));
const pendulum_1 = require("./classes/pendulum");
const express_1 = __importDefault(require("express"));
const default_config_1 = require("./data/default_config");
const functions_1 = require("./libs/functions");
dotenv_1.default.config();
console.log('SERVER_WORKER: Starting...');
console.log(`SERVER_WORKER: MPID=${default_config_1.MPID}`);
// ***
// EXPRESS server
// We don't really need it here, but for the monitoring let's keep it
const app = (0, express_1.default)();
const server = require('http').createServer(app);
const port = process.env.HTTP_PORT || 8080;
server.listen(port, () => {
    console.log(`EXPRESS: Server PORT=${port}`);
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ***
// MQTT client
let mqtt = new mqtt_1.mqttTools();
mqtt.build();
mqtt.setCallbacks({
    pauseSimulation: pauseSimulation,
    stopSimulation: stopSimulation,
    sendRESTARTMessage: mqtt.sendRESTARTMessage,
});
// ***
// Socket.io server
//export const io: Server = require('socket.io')(server);
// ***
// socket io client
console.log('SOCKET.IO: Building client socket node');
const mainWebsocketUrl = process.env.MAIN_WEBSOCKET_URL || "http://localhost:8080";
const socketClient = ioclient.connect(mainWebsocketUrl, {
    reconnection: true,
    reconnectionDelayMax: 1000,
    reconnectionDelay: 100,
    timeout: 100,
});
console.log(`SOCKET.IO: Connecting to SERVER_MAIN Socket server: ${mainWebsocketUrl}`);
// flags for server state
let run = false;
let inStop = false;
let inRun = false;
let inPause = false;
// Receiving Initial Settings
socketClient.on('init', (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!inStop) {
        console.log('CLIENT: Init received');
        //console.log(data);
        (0, functions_1.updateDefaultSettings)(data);
        const myItem = default_config_1.defaultItemsConfig.get(default_config_1.MPID);
        if (myItem) {
            (0, functions_1.updatePendulumSettings)(myItem);
            engineRun();
        }
        else {
            console.log(`No item with ID=${default_config_1.MPID} found in settings`);
        }
    }
    else {
        console.log('No Init during Stop event');
    }
}));
// Request to update settings received
socketClient.on('update_settings', (data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('CLIENT: Received update_settings, data=', data);
    if (data.id === default_config_1.MPID) {
        console.log('New settings MPID=', default_config_1.MPID);
        // updating current worker settings
        (0, functions_1.updatePendulumSettings)(data);
        engineRun();
    }
    else {
        console.log('settings not for me, sleeping...');
    }
}));
// Request to run simulation received
socketClient.on("run", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('CLIENT: Running simulation...');
    run = true;
    inRun = true;
    exports.onePendulum.run();
}));
// Request to stop simulation received
socketClient.on("stop", (data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('CLIENT: Stop simulation...');
    inStop = true;
    run = false;
    //console.log('Stop data: ', data);
    (0, functions_1.updateDefaultSettings)(data);
    const myItem = default_config_1.defaultItemsConfig.get(default_config_1.MPID);
    if (myItem) {
        (0, functions_1.updatePendulumSettings)(myItem);
    }
    else {
        console.log(`No item with ID=${default_config_1.MPID} found in settings`);
    }
    engineRun();
}));
// Request to pause simulation received
socketClient.on("pause", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('CLIENT: Pause simulation...');
    run = false;
    inPause = true;
    exports.onePendulum.pause();
}));
// on socket connect error
socketClient.on("connect_error", (err) => {
    console.log(`Socket.io: connect_error due to ${err.message}`);
});
socketClient.on('disconnect', () => {
    //socketCleanup(); // clean up listeners?
    console.log('on disconnect');
    socketClient.on('connect', function () {
        socketClient.connect();
    });
});
socketClient.on("reconnect_attempt", () => {
    console.log('Reconnection attempt');
});
// Setup engine
// Create pendulum based on config
let isCreated = createDefaultPendulum();
if (!isCreated) {
    console.error('Item not found! Exiting...');
    process.exit(1);
}
// subscribe to simulation events
engineRun();
// ***
// Functions
// ***
// Pause simulation
function pauseSimulation() {
    console.log('CLIENT: Pause simulation...');
    run = false;
    inPause = true;
    exports.onePendulum.pause();
}
// Stop simulation
function stopSimulation(data = null) {
    console.log('CLIENT: Stop simulation...');
    inStop = true;
    run = false;
    if (data) {
        //console.log('Stop data: ', data);
        (0, functions_1.updateDefaultSettings)(data);
    }
    const myItem = default_config_1.defaultItemsConfig.get(default_config_1.MPID);
    if (myItem) {
        (0, functions_1.updatePendulumSettings)(myItem);
    }
    else {
        console.log(`No item with ID=${default_config_1.MPID} found in settings`);
    }
    // rerun engine
    engineRun();
}
// Create pendulum based on received settings
function createDefaultPendulum() {
    console.log('Creating Default Pendulum');
    let defProps = default_config_1.defaultItemsConfig.get(default_config_1.MPID);
    if (defProps) {
        exports.onePendulum = new pendulum_1.Pendulum(defProps);
        exports.onePendulum.build();
        return true;
    }
    else {
        console.log("Can't find element with id=", default_config_1.MPID);
    }
    console.log('Pendulum created: ', exports.onePendulum.props);
    return false;
}
// Run engine loop
function engineRun() {
    return __awaiter(this, void 0, void 0, function* () {
        // For every iteration of physics engine send a report
        matter_js_1.default.Events.on(exports.onePendulum.runner, "afterTick", event => {
            if (run) {
                let json = exports.onePendulum.toJson();
                console.log('ENGINE: Sending simulation data to the Main Server');
                socketClient.emit('simulation_status', json);
            }
        });
        // no collision detection here, it will be calculated on the main server
        /*Matter.Events.on(onePendulum.engine, "collisionStart", event => {
            if (run) {
            }
        });*/
    });
}
// ***
// this is it
// ***
// Graceful shutdown
// closing everything
process.on('SIGTERM', () => {
    console.log('SERVER_WORKER: SIGTERM signal received.');
    server.close(() => {
        console.log('SERVER_WORKER: Closing MQTT connection...');
        mqtt_1.mqttTools.getClient().end();
        console.log('SERVER_WORKER: Closing socket.io ...');
        socketClient.close();
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SERVER_WORKER: SIGINT signal received.');
    server.close(() => {
        console.log('SERVER_WORKER: Closing MQTT connection...');
        mqtt_1.mqttTools.getClient().end();
        console.log('SERVER_WORKER: Closing socket.io ...');
        socketClient.close();
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map