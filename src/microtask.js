const getWebMicrotask = () => {
  const scope = window || self;
  if(scope) {
    const MutationObserver = scope.MutationObserver || scope.WebKitMutationObserver || scope.MozMutationObserver;
    const document = scope.document;
    if(MutationObserver && document) {
      const queue = [];
      const capacity = 1024;
      let index = 0;
      const run = () => {
        while(index < queue.length) {
          queue[index++]();
          if(index >= capacity) {
            queue.splice(0, index);
            index = 0;
          }
        }
        queue.length = 0;
        index = 0;
      }
      const target = document.createTextNode('');
      const observerInitConfig = {
        characterData: true
      }
      let data = 1;
      observer = new MutationObserver(run);
      observer.observe(target, observerInitConfig);
      return function microtask (fn) {
        if(!queue.length) {
          target.data = data = - data;
        }
        queue.push(fn);
      }
    }
  }
  return setTimeout;
}

const getNodeMicrotask = () => {
  if(process && process.nextTick) return process.nextTick;
  return setTimeout;
}

if(TARGET === 'web') {
  module.exports = getWebMicrotask();
} else if (TARGET === 'node') {
  module.exports = getNodeMicrotask();
} else {
  module.exports = setTimeout;
}
