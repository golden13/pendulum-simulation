import express from "express";
import { IPendulumElem } from "../classes/pendulum";
import { currentItems } from "../data/default_config";
import { io } from "..";
import { updatePendulumSettings } from "../libs/functions";

// Routes for HTTP REST API

const router = express.Router();

// Get settings
router.get('/settings', (req, res) => {
    console.log('REST: Request to send settings received');
    let data = currentItems;
    let arr: IPendulumElem[] = [];
    data.forEach(item => {
        arr.push(item);
    });

    return res.json(arr);
});

// Update settings
router.post('/settings', (req, res) => {
    try {
        const data: IPendulumElem = req.body;
        console.log('REST: Received new settings');
        //console.log('Received new settings', data);
        updatePendulumSettings(data);

        console.log('Sending "update_settings" message to other nodes...');

        // send broadcast message to backend clients to update their settings
        io.sockets.emit('update_settings', data);

        return res.json(data);
    } catch (err) {
        console.error(err);
    }
});


export {router as mainRouter}