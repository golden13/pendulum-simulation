import mqtt, { connect } from 'mqtt';
import env from 'dotenv';
import { getInitialElements, io } from '..';

env.config();

/**
 * MQTT Utility class
 */ 
class mqttTools {
    public static worker_messages: string[] = [];
    private protocol = 'mqtt';
    private host = process.env.MQTT_HOST;
    private port = process.env.MQTT_PORT; //'1883';
    private mainTopic = process.env.MQTT_MAIN_TOPIC || 'pendulum';
    private clientId = '';
    private connectUrl = '';

    public mqttClient: mqtt.MqttClient;

    constructor() {
        this.clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
        this.connectUrl = `${this.protocol}://${this.host}:${this.port}`;

        // no authentication for now
        this.mqttClient = connect(this.connectUrl, {
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
    public build() {
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
                            io.sockets.emit('restart_simulation', getInitialElements());
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
    public sendSTOPMessage() {
        const message = {m: 'STOP', data: {}};
        this.mqttClient.publish('pendulum', JSON.stringify(message), { qos: 2, retain: false }, function (error) {
            if (error) {
                console.log('MQTT: ', error)
            } else {
                console.log('MQTT: Message STOP Published')
            }
          }
        );
    }

    /**
     * Send restart message
     */
    public sendRESTARTMessage() {
        const message = {m: 'RESTART', data: {}};
        this.mqttClient.publish('pendulum', JSON.stringify(message), { qos: 2, retain: false }, function (error) {
            if (error) {
                console.log('MQTT: ', error)
            } else {
                console.log('MQTT: Message RESTART Published')
            }
        });
    }
}

export { mqttTools };
