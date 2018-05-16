// 事件循环最后执行
const eventLoopEndRun = (()=>{
  let unhandledPub;
  let timer;
  const queueHandler = [];
  // 激活事件循环最后执行
  const activateRun = ()=>{
    // 截流
    timer && clearTimeout(timer);
    timer = setTimeout(()=>{
      unhandledPub && unhandledPub();
      let handler = queueHandler.shift();
      while(handler){
        handler();
        handler = queueHandler.shift();
      }
    },0);
  }
  
  // 设置 unhanldedReject 优先级最高 ， 直接加入队列
  return (handler,immediate)=> {
    immediate ? unhandledPub = handler : queueHandler.push(handler);
    activateRun();
  }
})()

const runFucMaybeError = handler => {
  try {
    return handler();
  } catch(err) {
    return {
      iserror: FUCERROR,
      err
    };
  }
}

const isIterator = maybeIterator=>{
  if(!maybeIterator[Symbol.iterator])return `Cannot read property 'Symbol(Symbol.iterator)' of ${maybeIterator}`;
  return maybeIterator[Symbol.iterator]()
}

module.exports = {eventLoopEndRun, runFucMaybeError, isIterator}