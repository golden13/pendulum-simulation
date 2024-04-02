import env from 'dotenv';
import { mqttTools } from './libs/mqtt';
import * as ioclient from "socket.io-client";
import cors from 'cors';
import Matter from 'matter-js';
import { IPendulumElem, Pendulum } from './classes/pendulum';
import express from 'express';
import { MPID, defaultItemsConfig } from './data/default_config';
import { updateDefaultSettings, updatePendulumSettings } from './libs/functions';

env.config();


console.log('SERVER_WORKER: Starting...');
console.log(`SERVER_WORKER: MPID=${MPID}`);

// ***
// EXPRESS server
// We don't really need it here, but for the monitoring let's keep it
const app = express();
const server = require('http').createServer(app);
const port = process.env.HTTP_PORT || 8080;
server.listen(port, () => {
    console.log(`EXPRESS: Server PORT=${port}`);
});

app.use(cors());
app.use(express.json())

// ***
// MQTT client
let mqtt = new mqttTools();
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

// current pendulum class
export let onePendulum: Pendulum;

// flags for server state
let run: boolean = false;
let inStop = false;
let inRun = false;
let inPause = false;


// Receiving Initial Settings
socketClient.on('init', async (data: IPendulumElem[]) => {
    if (!inStop) {
        console.log('CLIENT: Init received');
        //console.log(data);
        updateDefaultSettings(data);

        const myItem = defaultItemsConfig.get(MPID);
        if (myItem) {
            updatePendulumSettings(myItem);
            engineRun();
        } else {
            console.log(`No item with ID=${MPID} found in settings`);
        }
    } else {
        console.log('No Init during Stop event');
    }
});

// Request to update settings received
socketClient.on('update_settings', async (data: IPendulumElem) => {
    console.log('CLIENT: Received update_settings, data=', data);
    if (data.id === MPID) {
        console.log('New settings MPID=', MPID);
        // updating current worker settings
        updatePendulumSettings(data);
        engineRun();
    } else {
        console.log('settings not for me, sleeping...');
    }
});

// Request to run simulation received
socketClient.on("run", async () => {
    console.log('CLIENT: Running simulation...');
    run = true;
    inRun = true;
    onePendulum.run();
});

// Request to stop simulation received
socketClient.on("stop", async (data) => {
    console.log('CLIENT: Stop simulation...');
    inStop = true;
    run = false;

    //console.log('Stop data: ', data);
    updateDefaultSettings(data);

    const myItem = defaultItemsConfig.get(MPID);
    if (myItem) {
        updatePendulumSettings(myItem);
    } else {
        console.log(`No item with ID=${MPID} found in settings`);
    }

    engineRun();
});

// Request to pause simulation received
socketClient.on("pause", async () => {
    console.log('CLIENT: Pause simulation...');
    run = false;
    inPause = true;
    onePendulum.pause();
});

// on socket connect error
socketClient.on("connect_error", (err: any) => {
    console.log(`Socket.io: connect_error due to ${err.message}`);
});

socketClient.on('disconnect', () => {
    //socketCleanup(); // clean up listeners?
    console.log('on disconnect');
    socketClient.on('connect', function(){
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
    onePendulum.pause();
}

// Stop simulation
function stopSimulation(data = null) {
    console.log('CLIENT: Stop simulation...');
    inStop = true;
    run = false;

    if (data) {
        //console.log('Stop data: ', data);
        updateDefaultSettings(data);
    }

    const myItem = defaultItemsConfig.get(MPID);
    if (myItem) {
        updatePendulumSettings(myItem);
    } else {
        console.log(`No item with ID=${MPID} found in settings`);
    }

    // rerun engine
    engineRun();
}

// Create pendulum based on received settings
function createDefaultPendulum() {
    console.log('Creating Default Pendulum');

    let defProps = defaultItemsConfig.get(MPID);
    if (defProps) {
        onePendulum = new Pendulum(defProps);
        onePendulum.build();
        return true;
    } else {
        console.log("Can't find element with id=", MPID);
    }

    console.log('Pendulum created: ', onePendulum.props);
    return false;
}

// Run engine loop
async function engineRun() {

    // For every iteration of physics engine send a report
    Matter.Events.on(onePendulum.runner, "afterTick", event => {
        if (run) {
            let json = onePendulum.toJson();
            console.log('ENGINE: Sending simulation data to the Main Server');
            socketClient.emit('simulation_status', json);
        }
    });

    // no collision detection here, it will be calculated on the main server
    /*Matter.Events.on(onePendulum.engine, "collisionStart", event => {
        if (run) {
        }
    });*/
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
        mqttTools.getClient().end();
        console.log('SERVER_WORKER: Closing socket.io ...');
        socketClient.close();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SERVER_WORKER: SIGINT signal received.');
    server.close(() => {
        console.log('SERVER_WORKER: Closing MQTT connection...');
        mqttTools.getClient().end();
        console.log('SERVER_WORKER: Closing socket.io ...');
        socketClient.close();
        process.exit(0);
    });
});
