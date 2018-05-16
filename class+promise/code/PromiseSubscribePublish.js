const UNHANDLEDREJECTION = 'UNHANDLEDREJECTION'; // 当前事件循环，无 catch 函数状态；
const REJECTIONHANDLED = 'REJECTIONHANDLED'; // 事件循环后，无 catch 函数状态；

class PromiseSubscribePublish{

  constructor(){
    this.subscribeUnhandler = new Map();
    this.subscribeHandler = new Map();
    this.errFuc = {}
  }

  // 监听事件绑定
  bindLisener (type, cb){
    if(type.toUpperCase() !== UNHANDLEDREJECTION && type.toUpperCase() !== REJECTIONHANDLED) throw Error('type toUpperCase must be UNHANDLEDREJECTION or REJECTIONHANDLED');
    if(Object.prototype.toString.call(cb) !== "[object Function]") throw Error('callback is not function');
    this.errFuc[type.toUpperCase()] = cb;
  }

  subscribe(promise, err){
    // 订阅一波，以当前 Promise 为 key，err 为参数,加入 unhandler map 中
    this.subscribeUnhandler.set(promise, err)
  }

  quitSubscribe(promise){
    this.subscribeUnhandler.delete(promise);
  }

  publish (type, promise) {
    
    let changgeStateFuc; // 定义当前状态变换操作
    const errFuc = this.errFuc[type]; // 当前绑定的监听函数


    
    if(type === UNHANDLEDREJECTION){
      // 没有订阅事件的 promise 则啥也不干
      if (!this.subscribeUnhandler.size) return;
      // 根据当前事件类型，选择处理函数
      changgeStateFuc = (err, promise)=>{
        this.subscribeHandler.set(promise);
        this.subscribeUnhandler.delete(promise, err);
      }
      // 不论如何当前时间循环下的等待队列状态全部需要变更
      if(errFuc){
        this.subscribeUnhandler.forEach((err, promise)=>{
          errFuc(err, promise)
          changgeStateFuc(err, promise)
        })
      } else {
        this.subscribeUnhandler.forEach((err, promise)=>{
          changgeStateFuc(err, promise)
          console.error('Uncaught (in promise)', err);
        })
      }

    } else {
      // 如果该 promise 没有进行订阅
      if(!this.subscribeHandler.has(promise)) return;
      // 哪个 promise 发布 catch 函数，就根据当前 Promise 执行相应方法，并将其从 Handler 订阅者里删除
      
      errFuc && errFuc(promise);
      this.subscribeHandler.delete(promise);

    } 

  }
}

// 定义一些静态成员变量 默认不可写
Object.defineProperties(PromiseSubscribePublish, {
  [UNHANDLEDREJECTION]:{
    value: UNHANDLEDREJECTION
  },
  [REJECTIONHANDLED]:{
    value: REJECTIONHANDLED
  }
})

module.exports = PromiseSubscribePublish;