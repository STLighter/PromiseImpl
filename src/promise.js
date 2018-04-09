const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

const microtask = require('./microtask');

const resolution = (promise, x, resolve, reject) => {
  if(promise === x) {
    return reject(new TypeError('Circular references'));
  }
  let called = false;
  const resolvePromise = y => {
    if(called) return;
    called = true;
    resolution(promise, y, resolve, reject);
  };
  const rejectPromise = r => {
    if(called) return;
    called = true;
    reject(r);
  }
  if(x instanceof MyPromise) {
    return x.then(resolvePromise, rejectPromise);
  }
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let then;
    try {
      then = x.then;
      if(typeof then === 'function') {
        return then.call(x, resolvePromise, rejectPromise);
      }
    } catch (err) {
      if(called) return;
      called = true;
      return reject(err);
    }
  }
  resolve(x);
}

class MyPromise {
  constructor (fn) {
    this.status = PENDING;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    const onFulfilled = value => {
      if(this.status !== PENDING) return;
      this.value = value;
      this.status = FULFILLED;
      this.onFulfilledCallbacks.forEach(cb => cb());
    };
    const onRejected = err => {
      if(this.status !== PENDING) return;
      this.error = err;
      this.status = REJECTED;
      this.onRejectedCallbacks.forEach(cb => cb());
    };
    const resolve = value => {
      resolution(this, value, onFulfilled, onRejected);
    }
    const reject = err => {
      onRejected(err);
    }
    try {
      fn(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  then (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
    const promise = new MyPromise((resolve, reject) => {
      const onFulfilledCallback = () => {
        microtask(() => {
          try {
            const ret = onFulfilled(this.value);
            resolve(ret);
          } catch (err) {
            reject(err);
          }
        })
      }
      const onRejectedCallback = () => {
        microtask(() => {
          try {
            const ret = onRejected(this.error);
            resolve(ret);
          } catch (err) {
            reject(err);
          }
        })
      }
      switch(this.status) {
        case FULFILLED: 
          onFulfilledCallback();
          break;
        case REJECTED:
          onRejectedCallback();
          break;
        case PENDING:
          this.onFulfilledCallbacks.push(onFulfilledCallback);
          this.onRejectedCallbacks.push(onRejectedCallback);
          break;
        default:
          throw new TypeError('Unknow promise status.');
      }
    });
    return promise;
  }
  catch (onRejected) {
    return this.then(null, onRejected);
  }
  finally (onFinally) {
    return this.then(onFinally, onFinally);
  }
}

MyPromise.resolve = value => {
  if(value instanceof MyPromise) {
    return value;
  } else {
    return new MyPromise(resolve => resolve(value));
  }
};

MyPromise.reject = err => new MyPromise((resolve, reject) => reject(err));

MyPromise.all = list => new MyPromise((resolve, reject) => {
  let left = list.length;
  const values = [];
  if(left === 0) return resolve(values);
  const resolverFactory = index => {
    return value => {
      --left;
      values[index] = value;
      if(left === 0) {
        resolve(values);
      }
    };
  };
  const rejector = err => reject(err);
  list.forEach((p, i) => {
    Promise.resolve(p).then(resolverFactory(i), rejector);
  });
});

MyPromise.race = list => new MyPromise((resolve, reject) => {
  let called = false;
  const resolver = value => {
    if(called) return;
    called = true;
    resolve(value);
  };
  const rejector = err => {
    if(called) return;
    called = true;
    reject(err);
  }
  list.forEach(p => MyPromise.resolve(p).then(resolver, rejector));
});

module.exports = MyPromise;