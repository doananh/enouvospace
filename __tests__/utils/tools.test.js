const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

var Tool = require('./../../cloud/utils/tools.js')

// UNIT test begin
describe('Tool Test', () => {
    beforeAll (() => {

    });

    test.skip('Get Code Test',() => {
      var testCode = Tool.getCode('A999');
      expect(testCode).toBe('B000');
      var testCode1 = Tool.getCode('Z999');
      expect(testCode1).toBe('A000');
      var testCode2 = Tool.getCode('A123');
      expect(testCode2).toBe('A124');
      var testCode3 = Tool.getCode("undefined");
      expect(testCode3).toBe("A001")
      var testCode4 = Tool.getCode(null);
      expect(testCode4).toBe("A001")
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
