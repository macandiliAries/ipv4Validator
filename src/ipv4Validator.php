<?php

namespace Validate\Ipv4;

/**
 * ipv4Validator
 * Library class for IPv4 validation.
 * @version 1.0
 */
class ipv4Validator
{   
    /**
     * Collection of the class property names for the IP ranges.
     * This is used for accessing the mentioned class properties using string representation [complex (curly) syntax].
     */
    private const RANGE_KEYS = ['invalidRanges', 'validRanges'];

    /**
     * Collection of invalid IP ranges (IP string => decimal value).
     * If this variable name is changed, kindly update the RANGE_KEYS constant.
     */
    private array $invalidRanges = [];

    /**
     * Collection of valid IP ranges (IP string => decimal value).
     * If this variable name is changed, kindly update the RANGE_KEYS constant.
     */
    private array $validRanges = [];

    /**
     * The IP address to be checked.
     */
    private string $ipAddress = '';

    /**
     * The IP address to be checked, but converted into decimal.
     */
    private int $decimalIpAddress = 0;

    /**
     * Clears the previously-loaded IP ranges of a specified range type. Clears all if no argument has been supplied.
     */
    public function clearRange(string $rangeType = '') : ipv4Validator
    {
        if (empty($rangeType) === true) {
            array_map(fn ($value) => $this->{$value} = [], self::RANGE_KEYS);
            return $this;
        }

        $rangeType .= 'Ranges';
        if (property_exists($this, $rangeType) === true) {
            $this->{$rangeType} = [];
        }

        return $this;
    }

    /**
     * Adds a new IP range.
     * ```
     * Example values for the $ipRange param:
     *     string: End range is optional.
     *        1.) '1.1.1.1'
     *        2.) '1.1.1.1 - 2.2.2.2'
     *        3.) '1.1.1.1 - 2.2.2.2, 3.3.3.3 - 4.4.4.4, 5.5.5.5'
     *     array: End range for each key is optional.
     *        1.) ['1.1.1.1']
     *        2.) ['1.1.1.1 - 2.2.2.2', ...]
     *        3.) ['1.1.1.1 - 2.2.2.2', '3.3.3.3 - 4.4.4.4', '5.5.5.5', ...]
     * ```
     */
    public function addRange(string $rangeType, array|string $ipRange) : ipv4Validator
    {
        $rangeType .= 'Ranges';
        if (property_exists($this, $rangeType) === false) {
            return $this;
        }

        if (is_string($ipRange) === true) {
            $ipRange = array_map('trim', explode(',', $ipRange));
        }

        // Add a default value of 0 per IP range key.
        $rangeToAdd = array_fill_keys($ipRange, 0);

        $this->{$rangeType} = array_merge($this->{$rangeType}, $rangeToAdd);
        return $this;
    }

    /**
     * Sets the IP address to be checked.
     */
    public function setIp(string $ipValue) : ipv4Validator
    {
        $this->ipAddress = $ipValue;
        return $this;
    }

    /**
     * Checks if the IP address set is a valid IPv4 address and falls on a valid range.
     */
    public function checkIp() : bool
    {
        // Check first if the IP address to be checked is a valid IPv4 address.
        if (filter_var($this->ipAddress, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) === false) {
            return false;
        }

        // Check if the supplied ranges to be used are valid IPv4 addresses.
        if ($this->convertRanges() === false) {
            return false;
        }

        // Convert the IP address to be checked to 8-bit, then to decimal form.
        $this->decimalIpAddress = $this->convertIpToBinaryToDecimal($this->ipAddress);

        return $this->checkRange();
    }

    /**
     * Converts each IP range into binary, then to decimal form.
     */
    private function convertRanges() : bool
    {
        foreach (self::RANGE_KEYS as $rangeType) {
            foreach (array_keys($this->{$rangeType}) as $ipRangeKey) {
                $ipRange    = array_map('trim', explode('-', $ipRangeKey));
                $startRange = $ipRange[0];
                $endRange   = (empty($ipRange[1]) === true) ? $startRange : $ipRange[1];

                // The start range or the end range must be a valid IPv4 address.
                if (filter_var($startRange, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) === false || filter_var($endRange, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) === false) {
                    return false;
                }

                $decimalStartRange = $this->convertIpToBinaryToDecimal($startRange);
                $decimalEndRange = $this->convertIpToBinaryToDecimal($endRange);

                // If the start range is larger than the end range, swap their values.
                if ($decimalStartRange > $decimalEndRange) {
                    $decimalEndRange += $decimalStartRange;
                    $decimalStartRange = $decimalEndRange - $decimalStartRange;
                    $decimalEndRange -= $decimalStartRange;
                }

                $this->{$rangeType}[$ipRangeKey] = $decimalStartRange . ' - ' . $decimalEndRange;
            }
        }

        return true;
    }

    /**
     * Converts each octet of the supplied IP address into 8-bit, then to decimal form.
     */
    private function convertIpToBinaryToDecimal(string $ipAddress) : int
    {
        // Use sprintf to convert each octet into 8-bit. Then, concatenate each 8-bit octet (to make it 32-bit) and convert it to decimal.
        return bindec(implode('', array_map(fn ($octet) => sprintf('%08b', $octet), explode('.', $ipAddress))));
    }

    /**
     * Checks if the IP address to be checked falls on a valid range.
     */
    private function checkRange() : bool
    {
        // If there are no ranges set, return as valid.
        if (empty($this->invalidRanges) === true && empty($this->validRanges) === true) {
            return true;
        }

        // Check first if the IP address to be checked falls on the invalid ranges set.
        $invalidMatches = $this->getMatches($this->invalidRanges);

        // If there are no invalid matches found, and the valid range array is empty, the IP address is considered as valid (since it is out of the invalid range).
        if ($invalidMatches === 0 && empty($this->validRanges) === true) {
            return true;
        }

        // Check if the IP address to be checked falls on the valid ranges set.
        $validMatches = $this->getMatches($this->validRanges);

        // There should be at least a match on the valid IP range/s set AND no match/es on the invalid IP range/s set.
        return $validMatches > 0 && $invalidMatches === 0;
    }

    /**
     * Returns the number of matches of a set IP address on a specified range.
     */
    private function getMatches(array $ipRange) : int
    {
        $matches = 0;
        foreach ($ipRange as $range) {
            list ($decimalStartRange, $decimalEndRange) = array_map('trim', explode('-', $range));
            if ($this->decimalIpAddress >= $decimalStartRange && $this->decimalIpAddress <= $decimalEndRange) {
                $matches++;
            }
        }
        return $matches;
    }
}
