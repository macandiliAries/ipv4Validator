<?php
use PHPUnit\Framework\TestCase;
use Validate\Ipv4\ipv4Validator;

/**
 * testIpv4Validator
 * @version 1.0
 */
class testIpv4Validator extends TestCase
{
    /**
     * ipv4Validator instance.
     */
    private ipv4Validator $ipv4Validator;

    /**
     * setUp
     */
    public function setUp() : void
    {
        $this->ipv4Validator = new ipv4Validator();
    }

    /**
     * testClearRange
     * @dataProvider testClearRangeProvider
     */
    public function testClearRange(string $rangeType) : void
    {
        $actualResult = $this->ipv4Validator->clearRange(($rangeType !== 'both') ? $rangeType : '');
        self::assertEquals($this->ipv4Validator, $actualResult);
    }

    /**
     * testClearRangeProvider
     */
    public function testClearRangeProvider() : array
    {
        return [
            // Dataset #0: Should both clear the valid and invalid ranges.
            [
                // Params:
                'both'
            ],
            // Dataset #1: Should only clear the valid range.
            [
                // Params:
                'valid'
            ],
            // Dataset #2: Should only clear the invalid range.
            [
                // Params:
                'invalid'
            ],
            // Dataset #3: Should not clear anything (incorrect argument supplied for rangeType).
            [
                // Params:
                'asdfghi'
            ]
        ];
    }

    /**
     * testAddRange
     * @dataProvider testAddRangeProvider
     */
    public function testAddRange(array $params) : void
    {
        $rangeType = key($params);
        $ipRange = $params[$rangeType];
        $actualResult = $this->ipv4Validator->addRange($rangeType, $ipRange);
        self::assertEquals($this->ipv4Validator, $actualResult);
    }

    /**
     * testAddRangeProvider
     */
    public function testAddRangeProvider() : array
    {
        return [
            // Dataset #0: Adding a single valid range of type string.
            [
                // Params:
                [
                    'valid' => '225.0.0.0 - 226.0.0.0'
                ]
            ],
            // Dataset #1: Adding multiple valid ranges of type string.
            [
                // Params:
                [
                    'valid' => '80.0.0.5 - 80.0.0.10, 81.0.0.0 - 82.0.0.0, 84.0.0.0 - 85.0.0.0'
                ]
            ],
            // Dataset #2: Adding an invalid range of type string.
            [
                // Params:
                [
                    'invalid' => '45.0.0.0 - 46.0.0.0'
                ]
            ],
            // Dataset #3: Adding multiple invalid ranges of type string.
            [
                // Params:
                [
                    'invalid' => '8.0.0.0 - 9.0.0.0, 10.0.0.0 - 15.0.0.0, 16.0.0.0 - 20.0.0.0'
                ]
            ],
            // Dataset #4: Adding a valid range of type array.
            [
                // Params:
                [
                    'valid' => ['0.0.100.0 - 0.0.200.0']
                ]
            ],
            // Dataset #5: Adding multiple valid ranges of type array.
            [
                // Params:
                [
                    'valid' => ['0.150.0.0 - 0.250.0.0', '1.150.0.0 - 1.250.0.0', '2.150.0.0 - 2.250.0.0']
                ]
            ],
            // Dataset #6: Adding an invalid range of type array.
            [
                // Params:
                [
                    'invalid' => ['9.9.9.9 - 10.10.10.10']
                ]
            ],
            // Dataset #7: Adding multiple invalid ranges of type array.
            [
                // Params:
                [
                    'invalid' => ['172.16.11.141 - 172.16.11.181', '172.16.12.1 - 172.16.12.10', '172.16.13.20 - 172.16.13.50']
                ]
            ],
            // Dataset #8: Adding a range using an invalid range type (returns immediately without doing anything to the ranges).
            [
                // Params:
                [
                    'invalidKey' => '100.100.100.100 - 200.200.200.200'
                ]
            ]
        ];
    }

    /**
     * testSetIp
     */
    public function testSetIp() : void
    {
        $actualResult = $this->ipv4Validator->setIp('192.168.1.1');
        self::assertEquals($this->ipv4Validator, $actualResult);
    }

    /**
     * testCheckIp
     * @dataProvider testCheckIpProvider
     */
    public function testCheckIp(array $params, bool $expectedResult) : void
    {
        if (array_key_exists('range', $params) === true) {
            array_walk($params['range'], fn ($ipRange, $rangeType) => $this->ipv4Validator->addRange($rangeType, $ipRange));
        }

        $actualResult = $this->ipv4Validator->setIp($params['ipAddress'])->checkIp();
        self::assertEquals($expectedResult, $actualResult);
    }

    /**
     * testCheckIpProvider
     */
    public function testCheckIpProvider() : array
    {
        return [
            // Dataset #0: Setting an invalid IP (only composed of 3 octets).
            [
                // Params:
                [
                    'ipAddress' => '172.16.1'
                ],
                // Result:
                false
            ],
            // Dataset #1: Setting an invalid IP (8-bit overflow for the first octet).
            [
                // Params:
                [
                    'ipAddress' => '256.255.255.255'
                ],
                // Result:
                false
            ],
            // Dataset #2: Setting an invalid range where IP to be checked falls on the invalid range.
            [
                // Params:
                [
                    'range'     => [
                        'invalid' => '192.0.0.0 - 193.0.0.0'
                    ],
                    'ipAddress' => '192.192.192.192'
                ],
                // Result:
                false
            ],
            // Dataset #3: Setting a string of valid range where IP to be checked falls on the valid range.
            [
                // Params:
                [
                    'range'     => [
                        'valid' => '192.0.0.0 - 193.0.0.0'
                    ],
                    'ipAddress' => '192.192.192.192'
                ],
                // Result:
                true
            ],
            // Dataset #4: Setting an invalid (string) IP address as range.
            [
                // Params:
                [
                    'range'     => [
                        'valid' => 'n.n.n.n'
                    ],
                    'ipAddress' => '1.2.3.4'
                ],
                // Result:
                false
            ],
            // Dataset #5: Setting an invalid (array) IP address as range.
            [
                // Params:
                [
                    'range'     => [
                        'valid' => ['255.255.255.256']
                    ],
                    'ipAddress' => '6.7.8.9'
                ],
                // Result:
                false
            ],
            // Dataset #6: Checking an IP address only (no ranges set).
            [
                // Params:
                [
                    'ipAddress' => '192.168.1.1'
                ],
                // Result:
                true
            ],
            // Dataset #7: Setting an array of valid ranges where the IP address to be checked is out of the range set.
            [
                // Params:
                [
                    'range'     => [
                        'valid' => ['100.0.0.0 - 200.0.0.0', '215.215.0.0']
                    ],
                    'ipAddress' => '215.216.217.218'
                ],
                // Result:
                false
            ],
            // Dataset #8: Setting an array of invalid ranges where the IP address to be checked is out of the range set (considered as true).
            [
                // Params:
                [
                    'range'     => [
                        'invalid' => ['100.0.0.0 - 200.0.0.0', '215.215.0.0']
                    ],
                    'ipAddress' => '215.216.217.218'
                ],
                // Result:
                true
            ],
            // Dataset #9: Setting an array of valid and invalid ranges where the IP address to be checked falls on the invalid range.
            [
                // Params:
                [
                    'range'     => [
                        'valid'   => ['50.0.0.0 - 50.0.255.254', '50.0.255.255'],
                        'invalid' => ['50.1.0.0 - 50.1.255.254', '50.1.255.255']
                    ],
                    'ipAddress' => '50.1.123.234'
                ],
                // Result:
                false
            ],
            // Dataset #10: Setting a string of valid ranges where IP to be checked falls on the valid range.
            [
                // Params:
                [
                    'range'     => [
                        'valid' => '171.0.0.0 - 172.0.0.0, 172.1.1.1 - 172.1.1.5'
                    ],
                    'ipAddress' => '172.1.1.3'
                ],
                // Result:
                true
            ],
            // Dataset #11: Setting an array of valid ranges (start range > end range) where IP to be checked falls on the valid range.
            [
                // Params:
                [
                    'range'     => [
                        'valid' => ['171.0.0.0 - 172.0.0.0', '172.1.1.255 - 172.1.1.115']
                    ],
                    'ipAddress' => '172.1.1.150'
                ],
                // Result:
                true
            ]
        ];
    }
}
