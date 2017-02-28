const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

var Tool = require('./../../cloud/util/Tool')

// UNIT test begin
describe('Tool Test', () => {
    beforeAll (() => {

    });

    test('Get Code Test',() => {
      var testCode = Tool.getCode();
      expect(testCode).toBe('A001');
    });

    test('Format Time Test', () => {
      var date = new Date('2017-02-28');
      var testTime = Tool.formatStringTime(date);
      expect(testTime).toMatch(/28-02-2017/);
    })

    afterAll (() => {

    });
});