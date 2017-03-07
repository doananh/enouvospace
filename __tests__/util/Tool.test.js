const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

var Tool = require('./../../cloud/utils/tools')

// UNIT test begin
describe('Tool Test', () => {
    beforeAll (() => {

    });

    test.skip('Get Code Test',() => {
      var testCode = Tool.getCode();
      expect(testCode).toBe('A001');
    });

    test.skip('Mock Test Expect GetCode FAILED',() => {
      var getCodeFn = Tool.getCode;
      getCodeFn = jest.fn();
      getCodeFn.mockReturnValueOnce('A000')
      expect(getCodeFn()).toBe('A001');
    });

    test.skip('Mock Test Expect GetCode SUCCESS',() => {
      var getCodeFn = Tool.getCode;
      getCodeFn = jest.fn();
      getCodeFn.mockReturnValueOnce('A001')
      expect(getCodeFn()).toBe('A001');
    });

    test.skip('Mock Test MultiValue Return', () => {
      var getCodeFn = Tool.getCode;
      getCodeFn = jest.fn();
      getCodeFn.mockReturnValueOnce('A001')
               .mockReturnValueOnce('A002')
               .mockReturnValueOnce('A003');
      expect(getCodeFn()).toBe('A001');
      expect(getCodeFn()).toBe('A002');
      expect(getCodeFn()).toBe('A003');
    });

    test.skip('Format Time Test', () => {
      var date = new Date('2017-02-28');
      var testTime = Tool.formatStringTime(date);
      expect(testTime).toMatch(/28-02-2017/);
    })

    afterAll (() => {

    });
});
