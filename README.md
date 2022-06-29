# IPv4 Validator
- This is a simple validator library _(written in PHP 8 and JavaScript)_ that checks if an IPv4 address is valid and falls in between a defined set of IPv4 ranges.
- Instead of using RegExp validations _(which is error-prone)_, this validator will convert each octet of the IPv4 address to be checked into 8-bit binary, then to decimal.
  - Then check if that IPv4 address is in between the ranges set _(which are converted first into 8-bit then into decimal as well)_.
- Adding of valid/invalid IPv4 address ranges can be dynamic.

## Table of Contents
- [Sample Psuedocode](#sample-pseudocode)
- [Installation via Dependency Managers](#installation-via-dependency-managers)
- [Sample Usages](#sample-usages)
- [Notes](#notes)
- [Testing](#testing)

## Sample Pseudocode
  ```
  Since an IPv4 address consists of 4 octets/bytes (32-bit), convert every octet of the IP into 8-bit.

  Sample IP Range (Valid): 1.0.0.0 -> 2.0.0.0
  1.0.0.0 = 00000001.00000000.00000000.00000000
          = 00000001000000000000000000000000
  2.0.0.0 = 00000010.00000000.00000000.00000000
          = 00000010000000000000000000000000

  Converting the Range into Decimal:
  1.0.0.0 = 00000001000000000000000000000000
          = 16777216
  2.0.0.0 = 00000010000000000000000000000000
          = 33554432

  IP to be Checked: 1.2.3.4
  1.2.3.4 = 00000001.00000010.00000011.00000100
          = 00000001000000100000001100000100

  Converting the IP to be Checked into Decimal:
  1.2.3.4 = 00000001000000100000001100000100
          = 16909060

  Now, check if 16909060 is in between of 16777216 and 33554432.
  ```

## Installation via Dependency Managers
**Using NPM _(JavaScript)_:**
```bash
# Create package.json file.
$ npm init
# Install the package.
$ npm install git+https://github.com/macandiliAries/ipv4Validator
```
**Using Composer _(PHP)_:**
```bash
# Create composer.json file.
$ composer init
```
- Then, update the created composer.json's "require" and "repositories" keys.
  ```javascript
    // ...
    "require": {
        "validate/ipv4": "^1.0.0"
    },
    // ...
    "repositories": [
        {
            "type": "git",
            "url": "https://github.com/macandiliAries/ipv4Validator"
        }
    ]
    // ...
  ```
  - Then, execute the `composer install` command on the terminal.

## Sample Usages
- **Checking the validity of an IPv4 address _(no range checking)_.**
  - PHP
    ```php
    <?php
    require_once __DIR__ . '/vendor/autoload.php';
    use Validate\Ipv4\ipv4Validator;

    $ipv4Validator = new ipv4Validator();
    $result = $ipv4Validator
        ->setIp('192.168.1.1')
        ->checkIp(); // Returns true.

    $result = $ipv4Validator
        ->setIp('192.168.1.a')
        ->checkIp(); // Returns false (invalid IP address).
    ```
  - JavaScript
    ```javascript
    const {ipv4Validator} = require('ipv4validator');
    let result = ipv4Validator
        .setIp('192.168.1.1')
        .checkIp(); // Returns true.

    result = ipv4Validator
        .setIp('192.168.1.a')
        .checkIp(); // Returns false (invalid IP address).
    ```
- **Adding a valid range then check the IP validity.**
  - PHP
    ```php
    <?php
    require_once __DIR__ . '/vendor/autoload.php';
    use Validate\Ipv4\ipv4Validator;

    $ipv4Validator = new ipv4Validator();
    $result = $ipv4Validator
        ->setIp('4.4.4.4')
        ->addRange('valid', ['1.0.0.0 - 2.0.0.0', '3.0.0.0'])
        ->checkIp(); // Returns false since the IP is out of the valid range.

    $result = $ipv4Validator
        ->addRange('valid', ['4.0.0.0 - 5.0.0.0'])
        ->checkIp(); // Returns true since the previously-set IP (4.4.4.4) falls on the valid range.
    ```
  - JavaScript
    ```javascript
    const {ipv4Validator} = require('ipv4validator');
    let result = ipv4Validator
        .setIp('4.4.4.4')
        .addRange('valid', ['1.0.0.0 - 2.0.0.0', '3.0.0.0'])
        .checkIp(); // Returns false since the IP is out of the valid range.

    result = ipv4Validator
        .addRange('valid', ['4.0.0.0 - 5.0.0.0'])
        .checkIp(); // Returns true since the previously-set IP (4.4.4.4) falls on the valid range.
    ```
- **Adding an invalid range then check the IP validity.**
  - PHP
    ```php
    <?php
    require_once __DIR__ . '/vendor/autoload.php';
    use Validate\Ipv4\ipv4Validator;

    $ipv4Validator = new ipv4Validator();
    $result = $ipv4Validator
        ->addRange('invalid', ['1.0.0.0 - 2.0.0.0', '3.0.0.0'])
        ->setIp('1.2.3.4')
        ->checkIp(); // Returns false, since the IP falls on the invalid range.
    ```
  - JavaScript
    ```javascript
    const {ipv4Validator} = require('ipv4validator');
    const result = ipv4Validator
        .addRange('invalid', ['1.0.0.0 - 2.0.0.0', '3.0.0.0'])
        .setIp('1.2.3.4')
        .checkIp(); // Returns false, since the IP falls on the invalid range.
    ```
- **Adding valid and invalid ranges then check the IP validity.**
  - PHP
    ```php
    <?php
    require_once __DIR__ . '/vendor/autoload.php';
    use Validate\Ipv4\ipv4Validator;

    $ipv4Validator = new ipv4Validator();
    $result = $ipv4Validator
        ->setIp('0.0.3.0')
        ->addRange('invalid', ['0.0.0.0 - 0.0.1.0', '0.0.2.0'])
        ->addRange('valid', ['1.1.0.0 - 2.2.0.0', '3.3.0.0'])
        ->checkIp(); // Returns false since the IP does not fall on any of the declared ranges.
    ```
  - JavaScript
    ```javascript
    const {ipv4Validator} = require('ipv4validator');
    const result = ipv4Validator
        .setIp('0.0.3.0')
        .addRange('invalid', ['0.0.0.0 - 0.0.1.0', '0.0.2.0'])
        .addRange('valid', ['1.1.0.0 - 2.2.0.0', '3.3.0.0'])
        .checkIp(); // Returns false since the IP does not fall on any of the declared ranges.
    ```

## Notes
- Adding of ranges can be an array or a string.
  ```
    Example:
    - string: End range is optional.
        1.) '1.1.1.1'
        2.) '1.1.1.1 - 2.2.2.2'
        3.) '1.1.1.1 - 2.2.2.2, 3.3.3.3 - 4.4.4.4, 5.5.5.5'
    - array: End range for each key is optional.
        1.) ['1.1.1.1']
        2.) ['1.1.1.1 - 2.2.2.2', ...]
        3.) ['1.1.1.1 - 2.2.2.2', '3.3.3.3 - 4.4.4.4', '5.5.5.5', ...]
  ```
- Invalid range checking always takes precedence.
- In case that a new IP range is needed to be added onto an existing range of IP addresses, just invoke the **addRange** method, and it will automatically append it to its respective range _(valid/invalid)_, just like the second and last examples on the [Sample Usages](#sample-usages) section.
- When declaring a fresh set of IP ranges _(without creating a new instance of the validator)_, it is **required** that the previously-set IP ranges be cleared _(by invoking the **clearIpRange** method)_.

## Testing
- Code has been tested using [Mocha _(a JavaScript test framework)_](https://mochajs.org/) and [PHPUnit _(a PHP test framework)_](https://phpunit.de/).
  - To check the unit tests, simply execute the following commands on the terminal:
    - For JavaScript:
      - If installed via NPM:
        - `cd ./node_modules/ipv4validator`
      - If cloned via Git:
        - `# Ensure that you are on the project's root directory.`
      - Then, type and execute the following:
        - `npm install`
        - `npm test`
    - For PHP:
      - If installed via Composer:
        - `cd ./vendor/validate/ipv4`
      - If cloned via Git:
        - `# Ensure that you are on the project's root directory.`
      - Then, type and execute the following:
        - `composer install`
        - `composer test`