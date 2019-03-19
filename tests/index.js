/*
 * Test runner
 */

const fs = require('fs');
const path = require('path');

const unit = require('./unit');

// Test runner
const testRunner = {};

// Container for the tests
testRunner.tests = {
};

// Build the test suite based on the arguments passed
testRunner.buildTestSuite = function () {
  const currentDirectory = process.cwd();
  const argument = process.argv[2];
  if (argument) {
    const testPath = argument[0] === '/' ? argument : path.join(currentDirectory, argument);
    if (fs.lstatSync(testPath).isFile()) {
      const suite = require(testPath);
      this.tests = { suite };
    } else if (fs.lstatSync(testPath).isDirectory()) {
      const files = fs.readdirSync(testPath);
      files.forEach((file) => {
        try {
          const suite = require(testPath);
          const suiteName = file.replace(/\.[^/.]+$/, '');
          this.tests[suiteName] = suite;
        } catch (e) {
          this.tests = this.tests;
        }
      });
    }
  } else {
    this.tests = {
      unit,
    };
  }
};

// Counter for the tests
testRunner.countTests = function () {
  let counter = 0;
  Object.keys(testRunner.tests).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(testRunner.tests, key)) {
      const subTests = testRunner.tests[key];
      Object.keys(subTests).forEach((testName) => {
        if (Object.prototype.hasOwnProperty.call(subTests, testName)) {
          counter += 1;
        }
      });
    }
  });
  return counter;
};

// Run the tests
testRunner.runTests = function () {
  this.buildTestSuite();
  const errors = [];
  let successes = 0;
  const limit = testRunner.countTests();
  let counter = 0;
  Object.keys(testRunner.tests).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(testRunner.tests, key)) {
      const subTests = testRunner.tests[key];
      console.log('============================================================');
      console.log('\x1b[33m%s\x1b[0m', `Suite: ${key}`);
      console.log('============================================================');
      Object.keys(subTests).forEach((testName) => {
        if (Object.prototype.hasOwnProperty.call(subTests, testName)) {
          (function () {
            const tempTestName = testName;
            const testValue = subTests[testName];
            // Call the test
            try {
              testValue(() => {
                console.log('\x1b[32m%s\x1b[0m', tempTestName);
                counter += 1;
                successes += 1;
                if (counter === limit) {
                  testRunner.produceTestReport(limit, successes, errors);
                }
              });
            } catch (e) {
              errors.push({
                name: testName,
                error: e,
              });
              console.log('\x1b[31m%s\x1b[0m', tempTestName);
              counter += 1;
              if (counter === limit) {
                testRunner.produceTestReport(limit, successes, errors);
              }
            }
          }());
        }
      });
    }
  });
};

// Print the test report
testRunner.produceTestReport = function (limit, successes, errors) {
  console.log('');
  console.log('--------------------TEST REPORT-----------------------');
  console.log('');
  console.log('Total Tests: ', limit);
  console.log('Pass: ', successes);
  console.log('Fail: ', errors.length);
  console.log('');
  if (errors.length > 0) {
    console.log('');
    console.log('--------------------BEGIN ERROR DETAILS-----------------------');
    console.log('');
    errors.forEach((err) => {
      console.log('\x1b[31m%s\x1b[0m', err.name);
      console.log(err.error);
      console.log('');
    });

    console.log('--------------------END ERROR DETAILS-----------------------');
  }
  console.log('');
};

// Call the testrunner function
testRunner.runTests();
