const inquirer = require('inquirer');

const questionsMaster = {
    apikey: {
        name: 'apikey',
        message: 'API Key:',
        validate: function (value) {
            if (value.length > 2) {
                return true;
            } else {
                return 'Please enter a valid Kontakt.io API Key'
            }
        }
    },
    env: {
        name: 'env',
        message: 'Environment:',
        type: 'list',
        choices: [
            {
                name: 'Test',
                value: 'test',
                short: 'Test'
            },
            {
                name: 'Accept',
                value: 'accept',
                short: 'Accept'
            },
            {
                name: 'Production',
                value: 'production',
                short: 'Production'
            }
        ],
        default: 0
    },
    source: {
        name: 'source',
        message: 'Data source:',
        when: function (answers) {
            if (answers.type === 'telemetry') {
                return false
            } else {
                return true
            }
        }
    },
    type: {
        name: 'type',
        message: 'Stream type:',
        type: 'list',
        choices: [
            {
                name: 'Presence data from a single Gateway or all Gateways in a Venue',
                value: 'presence',
                short: 'Presence'
            },
            {
                name: 'Sensors data from a single Beacon (except an accelerometer)',
                value: 'sensor',
                short: 'Sensor'
            },
            {
                name: 'Accelerometer data from a single Beacon',
                value: 'accelerometer',
                short: 'Accelerometer'
            },
            {
                name: 'Button press events from a button-equipped Beacon',
                value: 'button',
                short: 'Button'
            },
            {
                name: 'Health data from a single Beacon',
                value: 'health',
                short: 'Beacon Health'
            },
            {
                name: 'Complete Telemetry data from a single Beacon',
                value: 'all',
                short: 'Complete Telemetry'
            },
            {
                name: 'Complete Telemetry data from a all Beacons belonging to a given Company',
                value: 'telemetry',
                short: 'Company Telemetry'
            }
        ]
    },
    filter: {
        name: 'filter',
        message: 'Show results only for some MAC addresses?',
        type: 'list',
        choices: [
            {
                name: 'Yes',
                value: true,
                short: 'Yes'
            },
            {
                name: 'No',
                value: false,
                short: 'No'
            }
        ],
        default: 1, // Index of the choices array
        when: function (answers) {
            return answers.type === 'presence'
        }
    },
    macs: {
        name: 'macs',
        message: 'Comma-separated list of MAC addresses to look for in Presence stream:',
        when: function (answers) {
            if (answers.filter === undefined) {
                return false
            } else {
                return answers.filter
            }
        },
        validate: function (value) {
            if (value.length < '7c:53:3e:02:1f:34'.length) {
                return 'Please enter at least one valid MAC address';
            } else {
                const macRegEx = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
                const macArray = value.split(',');
                for (const mac of macArray) {
                    if (!macRegEx.test(mac)) {
                        return 'Please enter only valid MAC addresses'
                    }
                }
                return true
            }
        }
    },
    alias: {
        name: 'alias',
        message: 'Name for a preset (alphanumeric characters only, please):',
        validate: function (value) {
            if (value.length > 0) {
                return true;
            } else {
                return 'Please enter a valid name for your config'
            }
        }
    }
}

function askForMissingDetails(params, save) {
    const questions = [];

    for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] === undefined && key !== 'macs') {
            questions.push(questionsMaster[key]);
        }
    }

    if ((params['type'] === 'presence' || params['type'] === undefined) && params['macs'] === undefined) {
        questions.push(questionsMaster['filter']);
        questions.push(questionsMaster['macs']);
    }

    if (save) {
        questions.push(questionsMaster['alias']);
    }

    return inquirer.prompt(questions);
}

module.exports = {
    askForMissingDetails: askForMissingDetails
}
