"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mqttTools = void 0;
const mqtt_1 = require("mqtt");
const dotenv_1 = __importDefault(require("dotenv"));
const default_config_1 = require("../data/default_config");
dotenv_1.default.config();
/**
 * MQTT Utility class
 */
class mqttTools {
    constructor() {
        this.protocol = 'mqtt';
        this.host = process.env.MQTT_HOST;
        this.port = process.env.MQTT_PORT; //'1883';
        this.mainTopic = process.env.MQTT_MAIN_TOPIC || 'pendulum';
        this.clientId = '';
        this.connectUrl = '';
        this.clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
        this.connectUrl = `${this.protocol}://${this.host}:${this.port}`;
        // no authentication for now
        mqttTools.mqttClient = (0, mqtt_1.connect)(this.connectUrl, {
            clientId: this.clientId,
            clean: true,
            connectTimeout: 4000,
            //username: 'emqx',
            //password: 'public',
            reconnectPeriod: 1000,
        });
    }
    /**
     * get connection object
     *
     * @returns mqtt.MqttClient
     */
    static getClient() {
        return mqttTools.mqttClient;
    }
    /**
     * Set callbacks
     * @param callbacks
     */
    setCallbacks(callbacks) {
        mqttTools.callbacks = callbacks;
    }
    /**
     * setting up hooks
     */
    build() {
        mqttTools.mqttClient.on('connect', () => {
            console.log('MQTT: Connected');
            mqttTools.mqttClient.subscribe([this.mainTopic], () => {
                console.log(`MQTT: Subscribe to topic '${this.mainTopic}'`);
                // receive a message
            });
            mqttTools.mqttClient.on('message', function (topic, message) {
                let strMessage = message.toString();
                console.log(`MQTT: Message received: topic='${topic}, message=${strMessage}`);
                let objMessage = JSON.parse(strMessage);
                if (objMessage.m) {
                    if (objMessage.m === 'STOP') {
                        mqttTools.doPauseStop();
                    }
                    else if (objMessage.m === 'RESTART') {
                        mqttTools.callbacks.stopSimulation();
                    }
                }
            });
        });
        mqttTools.mqttClient.on('reconnect', () => {
            console.log('MQTT: Reconnecting...');
        });
        mqttTools.mqttClient.on('error', (error) => {
            console.error('MQTT: ', error);
        });
    }
    /**
     * Execute pause, and restart in 5 sec
     */
    static doPauseStop() {
        mqttTools.callbacks.pauseSimulation();
        setTimeout(() => {
            mqttTools.callbacks.stopSimulation();
            mqttTools.callbacks.sendRESTARTMessage();
        }, 5);
    }
    /**
     * Sends RESTART message to MQTT
     */
    sendRESTARTMessage() {
        const message = { m: 'RESTART', data: { mpid: default_config_1.MPID } };
        mqttTools.mqttClient.publish('pendulum', JSON.stringify(message), { qos: 2, retain: false }, function (error) {
            if (error) {
                console.log('MQTT: ', error);
            }
            else {
                console.log('MQTT: Message RESTART Published');
            }
        });
    }
}
exports.mqttTools = mqttTools;
// callback functions
mqttTools.callbacks = { pauseSimulation: () => { }, stopSimulation: () => { }, sendRESTARTMessage: () => { } };
//# sourceMappingURL=mqtt.js.map