import express from "express";
import { IPendulumElem } from "../classes/pendulum";
import { defaultItemsConfig } from "../data/default_config";

const router = express.Router();

// Basic metrics endpoint
router.get('/metrics', (req, res) => {
    let data = defaultItemsConfig;
    let arr: IPendulumElem[] = [];
    data.forEach(item => {
        arr.push(item);
    });

    return res.json(arr);
});

export {router as mainRouter}