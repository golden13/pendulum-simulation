import env from 'dotenv';
import { mqttTools } from './libs/mqtt';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { IPendulumElem } from './classes/pendulum';
import express from 'express';
import { mainRouter } from './routes/main';
import audit from 'express-requests-logger';
import { currentItems, resetCurrentItems } from './data/default_config';
import { getFPS, updatePendulumSettings } from './libs/functions';
import { checkCollisions } from './libs/collisions';

env.config();

console.log('SERVER: Starting...');

// ***
// Express server
const port = process.env.HTTP_PORT || 8080;
console.log(`EXPRESS: Server PORT=${port}`);

const app = express();
const server = require('http').createServer(app);
app.use(cors());
app.use(express.json())
//app.use(audit());
app.use("/", mainRouter);
app.use(express.static(path.join(__dirname, 'client-static')));

server.listen(port, () => {
  console.log('EXPRESS: started');
});

// ***
// Socket.io server
export const io: Server = require('socket.io')(server);

// ***
// MQTT server
export let mqtt = new mqttTools();
mqtt.build();

// flags for current server state
let inStop = false;
let inPause = false;
let inRun = false;

// websocket clients
const clients: string[] = [];


// When new client connected
io.sockets.on('connection',
    function (socket) {
        clients.push(socket.id); //Just used to give a unique id to each client
        console.log('SOCKET.IO: New client connected: ' + socket.id, ' Total number of clients: ', clients.length);

        //Send to all clients including browser
        io.sockets.emit('init', getInitialElements()); // send current items

        // Update setting received
        socket.on('update_settings', (data: IPendulumElem) => {
            console.log('SOCKET.IO: "update_settings" command received');
            if (inStop) {
                console.log('SOCKET.IO: New settings for MPID=', data.id);
                
                // updating current nodejs settings
                updatePendulumSettings(data);

                // send broadcast message to update backend clients
                io.sockets.emit('update_settings', data);
            } else {
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
            io.sockets.emit('run');
        });

        // pause command received
        socket.on('pause', () => {
            if (inRun)  {
                console.log('SOCKET.IO: "pause" command received');
                inRun = false;
                inStop = false;
                inPause = true;
                
                // sending message to all backend clients, to Pause simulation
                io.sockets.emit('pause');
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
                
                console.log('currentItems:', currentItems);

                // reset items to initial state
                resetCurrentItems();
            
                // sending message to all backend clients, to Stop simulation, and reinit items
                io.sockets.emit('stop', getInitialElements());
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
                updatePendulumSettings(data);

                // Here we need to check if 2 Pendulums are dangerous close
                // If yes, we send STOP MQTT message
                (async () => {
                    let detection = await checkCollisions();
                    console.log('Result: ', detection);
                    if (detection) {
                        // send STOP MQTT message
                        mqtt.sendSTOPMessage();
                        inPause = true;
                        inRun = false;

                        // set Websocket message to stop animation on the client
                        io.sockets.emit('collision_detected', detection);
                    }
                })();

                // calculate FPS
                let fps = getFPS(data);
                data.fps= fps.count;
                // emit [data]
                io.sockets.emit('items', [data]);
            } else {
                console.log('SOCKET.IO: "simulation_status" command ignored. Server in "stop" mode');
            }
        });
    }
);

/**
 * Get current pendulum items
 * @returns IPendulumElem[]
 */
export function getInitialElements() {
    let elements: IPendulumElem[] = [];
    currentItems.forEach(item => {
        elements.push(item);
    });

    return elements;
}

// ***
// shutdown
// closing everything
process.on('SIGTERM', () => {
    console.log('SERVER: SIGTERM signal received.');
    console.log('SERVER: Closing MQTT connection...');
    mqtt.mqttClient.end();
    console.log('SERVER: Closing socket.io ...');
    io.close();
  });
  
process.on('SIGINT', () => {
    console.log('SERVER: SIGINT signal received.');
    console.log('SERVER: Closing MQTT connection...');
    mqtt.mqttClient.end();
    console.log('SERVER: Closing socket.io ...');
    io.close();
});
