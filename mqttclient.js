const mqtt          = require('mqtt');
const assetBuilder  = require('./assetbuilder');
const os            = require('os');
const chalk         = require('chalk');
const presenter     = require('./datapresenter');

function startStream(streamConfig) {
    const connectionOptions = {
        username: os.hostname() + '-' + os.platform() + '-' + os.arch(),
        password: streamConfig.apikey
    }

    const broker = assetBuilder.makeStreamURL(streamConfig.env);
    const streamTopic = assetBuilder.makeTopic(streamConfig.type, streamConfig.source);

    const client = mqtt.connect(broker, connectionOptions);

    client.on('connect', function(connack) {
        console.log('Connected to Kontakt.io MQTT broker')
        console.log(connack);
        client.subscribe(streamTopic, function (error, granted) {
            if (!error) {
                console.log('Subscribing to ' + streamTopic + '…');
                console.log(granted);
                if (granted[0].qos > 100) {
                    client.emit('error', chalk.red(`✘ Invalid MQTT topic`));
                }
                console.log('Subscribed, waiting for messages…');
            } else {
                console.error('Something went wrong:');
                console.error(error);
                console.log('That was an error from subscribe')
            }
        });
    });

    client.on('error', function(error) {
        console.error(error);
        console.log('That was an error from \"on error\"');
        process.exit(1);
    });

    client.on('message', function(topic, message, packet) {
        presenter.present(message, streamConfig.type);
    });
}

module.exports = {
    startStream: startStream
};
