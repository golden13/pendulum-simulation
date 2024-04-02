import mqtt, { connect } from 'mqtt';
import env from 'dotenv';
import { MPID } from '../data/default_config';

env.config();

/**
 * For callbacks
 */
type MQTTCallbacks = {
    pauseSimulation: ()=>void, 
    stopSimulation: ()=>void,
    sendRESTARTMessage: ()=>void,
}

/**
 * MQTT Utility class
 */
class mqttTools {

    private protocol = 'mqtt';
    private host = process.env.MQTT_HOST;
    private port = process.env.MQTT_PORT; //'1883';
    private mainTopic = process.env.MQTT_MAIN_TOPIC || 'pendulum';
    private clientId = '';
    private connectUrl = '';

    // callback functions
    public static callbacks: MQTTCallbacks = {pauseSimulation: ()=>{}, stopSimulation: ()=>{}, sendRESTARTMessage: ()=>{}};
    
    // connection object
    public static mqttClient: mqtt.MqttClient;

    constructor() {
        this.clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
        this.connectUrl = `${this.protocol}://${this.host}:${this.port}`;

        // no authentication for now
        mqttTools.mqttClient = connect(this.connectUrl, {
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
    public static getClient() {
        return mqttTools.mqttClient;
    }

    /**
     * Set callbacks
     * @param callbacks 
     */
    public setCallbacks(callbacks: MQTTCallbacks) {
        mqttTools.callbacks = callbacks;
    }

    /**
     * setting up hooks
     */
    public build() {
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

                    } else if (objMessage.m === 'RESTART') {
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
    public static doPauseStop() {
        mqttTools.callbacks.pauseSimulation();

        setTimeout(()=> {
            mqttTools.callbacks.stopSimulation();
            mqttTools.callbacks.sendRESTARTMessage();
        }, 5);
    }

    /**
     * Sends RESTART message to MQTT
     */
    public sendRESTARTMessage() {
        const message = {m: 'RESTART', data: {mpid: MPID}};
        mqttTools.mqttClient.publish('pendulum', JSON.stringify(message), { qos: 2, retain: false }, function (error) {
            if (error) {
                console.log('MQTT: ', error)
            } else {
                console.log('MQTT: Message RESTART Published')
            }
        });
    }
}

export { mqttTools };
