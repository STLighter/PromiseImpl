const Promise = require('../dist/promise.js');
const assert = require('chai').assert;

// more infomation check https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
describe('Call callbacks as microtasks', function () {
  it('Should call onFulfilled before setTimeout', function (done) {
    const order = [];
    setTimeout(function() {
      order.push(2);
    }, 0);
    Promise.resolve().then(function() {
      order.push(1);
    });
    setTimeout(function () {
      assert.deepEqual(order, [1, 2]);
      done();
    }, 50);
  });
  it('Should call onRejected before setTimeout', function (done) {
    const order = [];
    setTimeout(function() {
      order.push(2);
    }, 0);
    Promise.reject().then(null, function() {
      order.push(1);
    });
    setTimeout(function () {
      assert.deepEqual(order, [1, 2]);
      done();
    }, 50);
  });
  it('Should run chain before setTimeout', function (done) {
    const order = [];
    setTimeout(function() {
      order.push(5);
    }, 0);
    Promise.resolve().then(function() {
      order.push(1);
    }).then(function() {
      order.push(2);
      throw '';
    }).then(null, function() {
      order.push(3);
      throw '';
    }).catch(function() {
      order.push(4);
    });
    setTimeout(function () {
      assert.deepEqual(order, [1, 2, 3, 4, 5]);
      done();
    }, 50);
  });
});

