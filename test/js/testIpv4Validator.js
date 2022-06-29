const assert = require('assert');
const ipv4ValidatorFilePath = '../../src/ipv4Validator';
let ipv4Validator = require(ipv4ValidatorFilePath);

describe('IPv4 Address Validator Library Test Suite', () => {
    afterEach(() => {
        // Create a fresh instance of the IIFE module after every test.
        delete require.cache[require.resolve(ipv4ValidatorFilePath)];
        ipv4Validator = require(ipv4ValidatorFilePath);
    });

    describe('#clearRange()', () => {
        const clearRangeDataProvider = [
            {rangeType: 'both', assertionDescription: 'Should both clear the valid and invalid ranges.'},
            {rangeType: 'valid', assertionDescription: 'Should only clear the valid range.'},
            {rangeType: 'invalid', assertionDescription: 'Should only clear the invalid range.'},
            {rangeType: 'asdfghi', assertionDescription: 'Should not clear anything (incorrect argument supplied for rangeType).'}
        ];

        clearRangeDataProvider.forEach((dataProvider, index) => {
            it(`Dataset #${index}: ${dataProvider.assertionDescription}`, () => {
                const actualResult = ipv4Validator.clearRange((dataProvider.rangeType !== 'both') ? dataProvider.rangeType : '');
                assert.equal(actualResult, ipv4Validator);
            });
        });
    });

    describe('#addRange()', () => {
        const addRangeDataProvider = [
            {rangeType: 'valid', ipRange: '225.0.0.0 - 226.0.0.0', assertionDescription: 'Adding a single valid range of type string.'},
            {rangeType: 'valid', ipRange: '80.0.0.5 - 80.0.0.10, 81.0.0.0 - 82.0.0.0, 84.0.0.0 - 85.0.0.0', assertionDescription: 'Adding multiple valid ranges of type string.'},
            {rangeType: 'invalid', ipRange: '45.0.0.0 - 46.0.0.0', assertionDescription: 'Adding an invalid range of type string.'},
            {rangeType: 'invalid', ipRange: '8.0.0.0 - 9.0.0.0, 10.0.0.0 - 15.0.0.0, 16.0.0.0 - 20.0.0.0', assertionDescription: 'Adding multiple invalid ranges of type string.'},
            {rangeType: 'valid', ipRange: ['0.0.100.0 - 0.0.200.0'], assertionDescription: 'Adding a valid range of type array.'},
            {rangeType: 'valid', ipRange: ['0.150.0.0 - 0.250.0.0', '1.150.0.0 - 1.250.0.0', '2.150.0.0 - 2.250.0.0'], assertionDescription: 'Adding multiple valid ranges of type array.'},
            {rangeType: 'invalid', ipRange: ['9.9.9.9 - 10.10.10.10'], assertionDescription: 'Adding an invalid range of type array.'},
            {rangeType: 'invalid', ipRange: ['172.16.11.141 - 172.16.11.181', '172.16.12.1 - 172.16.12.10', '172.16.13.20 - 172.16.13.50'], assertionDescription: 'Adding multiple invalid ranges of type array.'},
            {rangeType: 'invalidKey', ipRange: '100.100.100.100 - 200.200.200.200', assertionDescription: 'Adding a range using an invalid range type (returns immediately without doing anything to the ranges).'}
        ];

        addRangeDataProvider.forEach((dataProvider, index) => {
            it(`Dataset #${index}: ${dataProvider.assertionDescription}`, () => {
                const actualResult = ipv4Validator.addRange(dataProvider.rangeType, dataProvider.ipRange);
                assert.equal(actualResult, ipv4Validator);
            });
        });
    });
    
    describe('#setIp()', () => {
        const ipAddress = '192.168.1.1';
        it(`IP Address: ${ipAddress}`, () => {
            const actualResult = ipv4Validator.setIp(ipAddress);
            assert.equal(actualResult, ipv4Validator);
        });
    });

    describe('#checkIp()', () => {
        const checkIpDataProvider = [
            {ipAddress: '172.16.1', expectedResult: false, assertionDescription: 'Setting an invalid IP (only composed of 3 octets).'},
            {ipAddress: '256.255.255.255', expectedResult: false, assertionDescription: 'Setting an invalid IP (8-bit overflow for the first octet).'},
            {range: {'invalid': '192.0.0.0 - 193.0.0.0'}, ipAddress: '192.192.192.192', expectedResult: false, assertionDescription: 'Setting an invalid range where IP to be checked falls on the invalid range.'},
            {range: {'valid': '192.0.0.0 - 193.0.0.0'}, ipAddress: '192.192.192.192', expectedResult: true, assertionDescription: 'Setting a string of valid range where IP to be checked falls on the valid range.'},
            {range: {'valid': 'n.n.n.n'}, ipAddress: '1.2.3.4', expectedResult: false, assertionDescription: 'Setting an invalid (string) IP address as range.'},
            {range: {'valid': ['255.255.255.256']}, ipAddress: '6.7.8.9', expectedResult: false, assertionDescription: 'Setting an invalid (array) IP address as range.'},
            {ipAddress: '192.168.1.1', expectedResult: true, assertionDescription: 'Checking an IP address only (no ranges set).'},
            {range: {'valid': ['100.0.0.0 - 200.0.0.0', '215.215.0.0']}, ipAddress: '215.216.217.218', expectedResult: false, assertionDescription: 'Setting an array of valid ranges where the IP address to be checked is out of the range set.'},
            {range: {'invalid': ['100.0.0.0 - 200.0.0.0', '215.215.0.0']}, ipAddress: '215.216.217.218', expectedResult: true, assertionDescription: 'Setting an array of invalid ranges where the IP address to be checked is out of the range set (considered as true).'},
            {range: {'valid': ['50.0.0.0 - 50.0.255.254', '50.0.255.255'], 'invalid': ['50.1.0.0 - 50.1.255.254', '50.1.255.255']}, ipAddress: '50.1.123.234', expectedResult: false, assertionDescription: 'Setting an array of valid and invalid ranges where the IP address to be checked falls on the invalid range.'},
            {range: {'valid': '171.0.0.0 - 172.0.0.0, 172.1.1.1 - 172.1.1.5'}, ipAddress: '172.1.1.3', expectedResult: true, assertionDescription: 'Setting a string of valid ranges where IP to be checked falls on the valid range.'},
            {range: {'valid': ['171.0.0.0 - 172.0.0.0', '172.1.1.255 - 172.1.1.115']}, ipAddress: '172.1.1.150', expectedResult: true, assertionDescription: 'Setting an array of valid ranges (start range > end range) where IP to be checked falls on the valid range.'}
        ];

        checkIpDataProvider.forEach((dataProvider, index) => {
            it(`Dataset #${index}: ${dataProvider.assertionDescription}`, () => {
                if (dataProvider.hasOwnProperty('range') === true) {
                    for (const [rangeType, ipRange] of Object.entries(dataProvider.range)) {
                        ipv4Validator.addRange(rangeType, ipRange);
                    }
                }

                const actualResult = ipv4Validator
                    .setIp(dataProvider.ipAddress)
                    .checkIp();

                assert.equal(actualResult, dataProvider.expectedResult);
            });
        });
    });
});
