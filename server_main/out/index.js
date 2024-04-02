"use strict";
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
exports.getInitialElements = exports.mqtt = exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mqtt_1 = require("./libs/mqtt");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const main_1 = require("./routes/main");
const default_config_1 = require("./data/default_config");
const functions_1 = require("./libs/functions");
const collisions_1 = require("./libs/collisions");
dotenv_1.default.config();
console.log('SERVER: Starting...');
// ***
// Express server
const port = process.env.HTTP_PORT || 8080;
console.log(`EXPRESS: Server PORT=${port}`);
const app = (0, express_1.default)();
const server = require('http').createServer(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//app.use(audit());
app.use("/", main_1.mainRouter);
app.use(express_1.default.static(path_1.default.join(__dirname, 'client-static')));
server.listen(port, () => {
    console.log('EXPRESS: started');
});
// ***
// Socket.io server
exports.io = require('socket.io')(server);
// ***
// MQTT server
exports.mqtt = new mqtt_1.mqttTools();
exports.mqtt.build();
// flags for current server state
let inStop = false;
let inPause = false;
let inRun = false;
// websocket clients
const clients = [];
// When new client connected
exports.io.sockets.on('connection', function (socket) {
    clients.push(socket.id); //Just used to give a unique id to each client
    console.log('SOCKET.IO: New client connected: ' + socket.id, ' Total number of clients: ', clients.length);
    //Send to all clients including browser
    exports.io.sockets.emit('init', getInitialElements()); // send current items
    // Update setting received
    socket.on('update_settings', (data) => {
        console.log('SOCKET.IO: "update_settings" command received');
        if (inStop) {
            console.log('SOCKET.IO: New settings for MPID=', data.id);
            // updating current nodejs settings
            (0, functions_1.updatePendulumSettings)(data);
            // send broadcast message to update backend clients
            exports.io.sockets.emit('update_settings', data);
        }
        else {
            console.log('Settings can be updated only the server in Stop mode, ignoring request...');
        }
    });
    // run command received
    socket.on('run', () => {
        console.log('SOCKET.IO: "run" command received');
        inRun = true;
        inPause = false;
        inStop = false;
        // sending message to all backend clients, to Run simulation
        exports.io.sockets.emit('run');
    });
    // pause command received
    socket.on('pause', () => {
        if (inRun) {
            console.log('SOCKET.IO: "pause" command received');
            inRun = false;
            inStop = false;
            inPause = true;
            // sending message to all backend clients, to Pause simulation
            exports.io.sockets.emit('pause');
        }
    });
    // stop command received
    socket.on('stop', () => {
        if (inRun || inPause) {
            console.log('SOCKET.IO: "stop" command received');
            inStop = true;
            inRun = false;
            inPause = false;
            console.log('Stop...');
            console.log('currentItems:', default_config_1.currentItems);
            // reset items to initial state
            (0, default_config_1.resetCurrentItems)();
            // sending message to all backend clients, to Stop simulation, and reinit items
            exports.io.sockets.emit('stop', getInitialElements());
        }
    });
    // client disconnected
    socket.on('disconnect', () => {
        // removing client from array
        const index = clients.indexOf(socket.id);
        if (index > -1) {
            clients.splice(index, 1);
        }
        console.log('SOCKET.IO: Client disconnected: ' + socket.id, ' Total number of clients: ', clients.length);
    });
    // receiving simulation data from backend clients and send it to web client
    // data = {}
    socket.on('simulation_status', (data) => {
        if (inRun) { // only when running
            console.log('SOCKET.IO: "simulation_status" command received');
            (0, functions_1.updatePendulumSettings)(data);
            // Here we need to check if 2 Pendulums are dangerous close
            // If yes, we send STOP MQTT message
            (() => __awaiter(this, void 0, void 0, function* () {
                let detection = yield (0, collisions_1.checkCollisions)();
                console.log('Result: ', detection);
                if (detection) {
                    // send STOP MQTT message
                    exports.mqtt.sendSTOPMessage();
                    inPause = true;
                    inRun = false;
                    // set Websocket message to stop animation on the client
                    exports.io.sockets.emit('collision_detected', detection);
                }
            }))();
            // calculate FPS
            let fps = (0, functions_1.getFPS)(data);
            data.fps = fps.count;
            // emit [data]
            exports.io.sockets.emit('items', [data]);
        }
        else {
            console.log('SOCKET.IO: "simulation_status" command ignored. Server in "stop" mode');
        }
    });
});
/**
 * Get current pendulum items
 * @returns IPendulumElem[]
 */
function getInitialElements() {
    let elements = [];
    default_config_1.currentItems.forEach(item => {
        elements.push(item);
    });
    return elements;
}
exports.getInitialElements = getInitialElements;
// ***
// shutdown
// closing everything
process.on('SIGTERM', () => {
    console.log('SERVER: SIGTERM signal received.');
    console.log('SERVER: Closing MQTT connection...');
    exports.mqtt.mqttClient.end();
    console.log('SERVER: Closing socket.io ...');
    exports.io.close();
});
process.on('SIGINT', () => {
    console.log('SERVER: SIGINT signal received.');
    console.log('SERVER: Closing MQTT connection...');
    exports.mqtt.mqttClient.end();
    console.log('SERVER: Closing socket.io ...');
    exports.io.close();
});
//# sourceMappingURL=index.js.map