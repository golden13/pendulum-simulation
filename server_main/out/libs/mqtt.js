"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mqttTools = void 0;
const mqtt_1 = require("mqtt");
const dotenv_1 = __importDefault(require("dotenv"));
const __1 = require("..");
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
        this.mqttClient = (0, mqtt_1.connect)(this.connectUrl, {
            clientId: this.clientId,
            clean: true,
            connectTimeout: 4000,
            //username: 'emqx',
            //password: 'public',
            reconnectPeriod: 1000,
        });
        console.log(`MQTT: url=${this.connectUrl}`);
    }
    /**
     * Build all hooks
     */
    build() {
        this.mqttClient.on('connect', () => {
            console.log('MQTT: Connected');
            this.mqttClient.subscribe([this.mainTopic], () => {
                console.log(`MQTT: Subscribe to topic '${this.mainTopic}'`);
            });
            this.mqttClient.on('message', function (topic, message) {
                let strMessage = message.toString();
                console.log(`MQTT: Message received: topic='${topic}, message=${strMessage}`);
                let objMessage = JSON.parse(strMessage);
                if (objMessage.m) {
                    if (objMessage.m === 'RESTART') {
                        // calculate restart messages
                        mqttTools.worker_messages.push(objMessage.mpid);
                        if (mqttTools.worker_messages.length === 5) {
                            console.log('All Workers send "restart" message');
                            console.log('Restarting system...');
                            // set Websocket message to browser, to reset animation
                            __1.io.sockets.emit('restart_simulation', (0, __1.getInitialElements)());
                            mqttTools.worker_messages = [];
                        }
                    }
                }
            });
        });
        this.mqttClient.on('reconnect', () => {
            console.log('MQTT: Reconnecting...');
        });
        this.mqttClient.on('error', (error) => {
            console.error('MQTT: ', error);
        });
    }
    /**
     * Send stop message
     */
    sendSTOPMessage() {
        const message = { m: 'STOP', data: {} };
        this.mqttClient.publish('pendulum', JSON.stringify(message), { qos: 2, retain: false }, function (error) {
            if (error) {
                console.log('MQTT: ', error);
            }
            else {
                console.log('MQTT: Message STOP Published');
            }
        });
    }
    /**
     * Send restart message
     */
    sendRESTARTMessage() {
        const message = { m: 'RESTART', data: {} };
        this.mqttClient.publish('pendulum', JSON.stringify(message), { qos: 2, retain: false }, function (error) {
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
mqttTools.worker_messages = [];
//# sourceMappingURL=mqtt.js.map