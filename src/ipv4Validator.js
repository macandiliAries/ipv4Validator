/**
 * Revealing module (IIFE) for IPv4 validation.
 * @module ipv4Validator
 */
const ipv4Validator = (() => {
    /**
     * Collection of variable names for the IP ranges.
     * @type {string[]}
     */
    const RANGE_KEYS = ['validRanges', 'invalidRanges'];

    /**
     * Collection of invalid IP ranges (IP string => decimal value).
     * If this variable name is changed, kindly update the RANGE_KEYS constant.
     * @type {{string: number}}
     */
    let invalidRanges = {};

    /**
     * Collection of valid IP ranges (IP string => decimal value).
     * If this variable name is changed, kindly update the RANGE_KEYS constant.
     * @type {{string: number}}
     */
    let validRanges = {};

    /**
     * IPv4 Address Pattern (composed of non-capturing groups so that the subject string will be matched as a whole.)
     * @type {RegExp}
     */
    const FULL_IP_REGEXP = /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

    /**
     * @type {string}
     */
    let ipAddress = '';

    /**
     * @type {int}
     */
    let decimalIpAddress = 0;

    /**
     * clearRange
     * Clears the previously-loaded IP ranges of a specified range type. Clears all if no argument has been supplied.
     * @alias ipv4Validator
     * @param {'valid'|'invalid'} rangeType
     * @returns ipv4Validator
     */
    const clearRange = (rangeType) => {
        if (inArray(rangeType, ['', null, undefined]) === true) {
            invalidRanges = {};
            validRanges = {};
            return ipv4Validator;
        }

        rangeType = `${rangeType}Ranges`;
        if (inArray(rangeType, RANGE_KEYS) === false) {
            return ipv4Validator;
        }

        if (rangeType === 'invalidRanges') {
            invalidRanges = {};
        } else {
            validRanges = {};
        }

        return ipv4Validator;
    }

    /**
     * Checks for a value inside an array.
     * @param {string|number} needle
     * @param {array} haystack
     * @returns boolean
     */
    const inArray = (needle, haystack) => {
        return haystack.includes(needle) === true;
    }

    /**
     * Adds a new IP range.
     *  ```
     * Example values for the ipRange param:
     *      string: End range is optional.
     *          1.) '1.1.1.1'
     *          2.) '1.1.1.1 - 2.2.2.2'
     *          3.) '1.1.1.1 - 2.2.2.2, 3.3.3.3 - 4.4.4.4, 5.5.5.5'
     *      array: End range for each key is optional.
     *          1.) ['1.1.1.1']
     *          1.) ['1.1.1.1 - 2.2.2.2', ...]
     *          2.) ['1.1.1.1 - 2.2.2.2', '3.3.3.3 - 4.4.4.4', '5.5.5.5', ...]
     * ```
     * @alias ipv4Validator
     * @param {'valid'|'invalid'} rangeType
     * @param {array|string} ipRange
     * @returns ipv4Validator
     */
    const addRange = (rangeType, ipRange) => {
        rangeType = `${rangeType}Ranges`;
        if (inArray(rangeType, RANGE_KEYS) === false) {
            return ipv4Validator;
        }

        if (typeof ipRange === 'string') {
            ipRange = ipRange.split(',').map((range) => range.trim());
        }

        // Convert the IP range array into an object and add a default value of 0 per IP range key as its value pair.
        const rangeToAdd = Object.assign(...ipRange.map(range => ({[range]: 0 })));

        if (rangeType === 'invalidRanges') {
            invalidRanges = Object.assign({}, invalidRanges, rangeToAdd);
        } else {
            validRanges = Object.assign({}, validRanges, rangeToAdd);
        }

        return ipv4Validator;
    }

    /**
     * Sets the IP address to be checked.
     * @alias ipv4Validator
     * @param {string} ipValue
     * @returns ipv4Validator
     */
     const setIp = (ipValue) => {
        ipAddress = ipValue;
        return ipv4Validator;
    }

    /**
     * Checks if the IP address set is a valid IPv4 address and falls on a valid range.
     * @alias ipv4Validator
     * @returns boolean
     */
    const checkIp = () => {
        // Check first if the IP address to be checked is a valid IPv4 address.
        if (ipAddress.match(FULL_IP_REGEXP) === null) {
            return false;
        }

        // Check if the supplied ranges to be used are valid IPv4 addresses.
        if (convertRanges() === false) {
            return false;
        }

        // Convert the IP address to be checked to 8-bit, then to decimal form.
        decimalIpAddress = convertIpToBinaryToDecimal(ipAddress);

        return checkRange();
    }

    /**
     * Converts each IP range into binary, then to decimal form.
     * @returns boolean
     */
    const convertRanges = () => {
        for (const rangeType of RANGE_KEYS) {
            for (const ipRangeKey in (rangeType === 'validRanges') ? validRanges : invalidRanges) {
                const ipRange    = ipRangeKey.split('-').map((range) => range.trim());
                const startRange = ipRange[0];
                const endRange   = (inArray(ipRange[1], ['', null, undefined]) === true) ? startRange : ipRange[1];

                // The start range or the end range must be a valid IPv4 address.
                if (startRange.match(FULL_IP_REGEXP) === null || endRange.match(FULL_IP_REGEXP) === null) {
                    return false;
                }

                let decimalStartRange = convertIpToBinaryToDecimal(startRange);
                let decimalEndRange = convertIpToBinaryToDecimal(endRange);

                // If the start range is larger than the end range, swap their values.
                if (decimalStartRange > decimalEndRange) {
                    decimalEndRange += decimalStartRange;
                    decimalStartRange = decimalEndRange - decimalStartRange;
                    decimalEndRange -= decimalStartRange;
                }

                const decimalRange = `${decimalStartRange} - ${decimalEndRange}`;
                if (rangeType === 'invalidRanges') {
                    invalidRanges[ipRangeKey] = decimalRange;
                } else {
                    validRanges[ipRangeKey] = decimalRange;
                }
            }
        }

        return true;
    }

    /**
     * Converts each octet of the supplied IPv4 address into 8-bit, then to decimal form.
     * @param {string} ipAddress
     * @returns int
     */
    const convertIpToBinaryToDecimal = (ipAddress) => {
        let returnValue = '';
        for (const octet of ipAddress.split('.')) {
            // Use zero-fill right shift bitwise operator to convert each octet of the IP into 32-bit, then use padStart to make it 8-bit.
            returnValue += (parseInt(octet, 10) >>> 0)
                .toString(2)
                .padStart(8, '0');
        }
        // Convert the value into decimal.
        return parseInt(returnValue, 2);
    }

    /**
     * Checks if the IP address to be checked falls on the specified range/s.
     * @returns boolean
     */
    const checkRange = () => {
        // If there are no ranges set, return as valid.
        if (Object.keys(invalidRanges).length === 0 && Object.keys(validRanges).length === 0) {
            return true;
        }

        // Check first if the IP address to be checked falls on the invalid ranges set.
        const invalidMatches = getMatches(invalidRanges);

        // If there are no invalid matches found, and the valid range object is empty, the IP address is considered valid (since it is out of the invalid range).
        if (invalidMatches === 0 && Object.keys(validRanges).length === 0) {
            return true;
        }

        // Check if the IP address to be checked falls on the valid ranges set.
        const validMatches = getMatches(validRanges);

        // There should be at least a match on the valid IP range/s set AND no match/es on the invalid IP range/s set.
        return validMatches > 0 && invalidMatches === 0;
    }

    /**
     * Returns the number of matches of a set IP address on a specified range.
     * @param {object} ipRange 
     * @returns int
     */
    const getMatches = (ipRange) => {
        let matches = 0;
        for (const range in ipRange) {
            const [decimalStartRange, decimalEndRange] = ipRange[range]
                .split('-')
                .map((range) => range.trim());

            if (decimalIpAddress >= decimalStartRange && decimalIpAddress <= decimalEndRange) {
                matches++;
            }
        }
        return matches;
    }

    /**
     * Reveal the public pointers.
     */
    return {clearRange, addRange, setIp, checkIp};
})();

module.exports = ipv4Validator;
