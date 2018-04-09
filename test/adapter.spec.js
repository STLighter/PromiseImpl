const Promise = require('../dist/promise.js');

module.exports = {
  resolved: Promise.resolve,
  rejected: Promise.reject,
  deferred: function () {
    const defer = {};
    defer.promise = new Promise(function (resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
    });
    return defer;
  }
};