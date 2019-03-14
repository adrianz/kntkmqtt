const chalk = require('chalk');
const axios = require('axios');

function makeTopic(type, source) {
    switch (type) {
        case 'presence':
            // TODO: Find a better way to differentiate between a device and a venue
            if (source.length < 25) {
                return '/presence/stream/' + source;
            } else {
                return '/stream/' + source + '/presence'
            }
        case 'health':
        case 'accelerometer':
        case 'sensor':
        case 'button':
        case 'all':
        case 'location':
            return '/stream/' + source + '/' + type;
        case 'telemetry':
            return type + '/' + source
        default:
            console.error(chalk.red('Unknown stream type'));
            process.exit(1);
    }
}

function makeStreamURL(env) {
    switch (env) {
        case 'production':
            return 'mqtts://mqtt.kontakt.io:8083';
        case 'accept':
            return 'mqtts://acceptmqtt.kontakt.io:8083';
        case 'test':
            return 'mqtts://testmqtt.kontakt.io:8083';
        default:
            console.error(chalk.red('☢︎ Unknown environment ☢︎'));
            process.exit(1);
    }
}

function makeApiURL(env) {
    switch (env) {
        case 'production':
            return 'https://api.kontakt.io';
        case 'accept':
            return 'https://acceptapi.kontakt.io';
        case 'test':
            return 'https://testapi.kontakt.io';
        default:
            console.error(chalk.red('☢︎ Unknown environment ☢︎'));
            process.exit(1);
    }
}

function getCompanyKey(env, apiKey) {
    let url = makeApiURL(env);
    let headers = {
        'Accept': 'application/vnd.com.kontakt+json; version=10',
        'Api-Key': apiKey
    };
    return axios.get(`${url}/manager/me`, { headers }).then(response => {
        let companyId = response.data.companyId;
        console.log(`${chalk.green('✔︎')} Fetched companyId ${companyId}`);
        return companyId;
    }).catch(function (error) {
        console.error(chalk.red('Something went wrong while requesting data from Kontakt.io API…'));
        console.error(error);
        process.exit(1);
    })
}

function getMissingCompanyId(missingData) {
    if (missingData.type === 'telemetry' && (!missingData.source || missingData.source === '')) {
        // TODO: This is a bit problematic, since Env & API Key can be provided via
        //       CLI parameters, so they won't be part of the missingData
        return getCompanyKey(missingData.env, missingData.apikey);
    } else
        return Promise.resolve(missingData.source);
}

module.exports = {
    getMissingCompanyId,
    makeTopic: makeTopic,
    makeStreamURL: makeStreamURL
}