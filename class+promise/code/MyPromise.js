const PENDDING = 'pendding';
const FULFILLED = 'resolved';
const REJECTED = 'rejected';
const FUCERROR = 'FUCERROR';

const PromiseSubscribePublish = require('./PromiseSubscribePublish');
const {
  eventLoopEndRun,
  runFucMaybeError,
  isIterator
} = require('./utils.js');
const promiseSubscribePublish = new PromiseSubscribePublish();

const clearLinksSubscribe = linkPrePromise=>{
  while(linkPrePromise && !linkPrePromise.hascatch){
    linkPrePromise.hascatch = true;
    promiseSubscribePublish.quitSubscribe(linkPrePromise);
    linkPrePromise = linkPrePromise.linkPrePromise;
  }
}

class MyPromise{
  
  constructor(handler){
    // 数据初始化
    this.init();

    // handler.then 函数中 this 能获取到当前值
    if(Object.prototype.toString.call(handler) === "[object Object]" && handler.then){
      this.doHandler(handler.then.bind(handler));
    }
    // construct 方法新增一个类型，当 new 关键字进来传递的不是一个函数，抛出一个错误
    else if(Object.prototype.toString.call(handler) !== "[object Function]"){
      throw new Error(`MyPromise resolver ${typeof handler} is not a function`)
    } else {
      // 方法传递，this指向会变，通过 bind 保持两个方法对当前对象的引用
      // 当然也可以这么玩：data=>this.resolve(data)
      this.doHandler(handler);
    }
    
  }
  
  // 数据初始化
  init(){
    Object.defineProperties(this,{
      '[[PromiseState]]': {
        value: PENDDING,
        writable: true,
        enumerable: false
      },
      '[[PromiseValue]]': {
        value: undefined,
        writable: true,
        enumerable: false
      },
      'thenQueue':{
        value: [],
        writable: true,
        enumerable: false
      },
      'catchQueue':{
        value: [],
        writable: true,
        enumerable: false
      }
    })
  }
  doHandler(handler){
    try{
      handler(this.resolve.bind(this), this.reject.bind(this));
    } catch(err) {
      this.reject(err);
    }
  }
  // 获取当前状态
  getPromiseState (){
    return this['[[PromiseState]]'];
  }
  // 设置当前状态
  setPromiseState (state) {
    Object.defineProperty(this, '[[PromiseState]]', {
      value: state,
      writable: false
    })
  }

  // 获取当前值
  getPromiseValue (){
    return this['[[PromiseValue]]'];
  }
  // 设置当前值
  setPromiseValue (val) {
    Object.defineProperty(this, '[[PromiseValue]]', {
      value: val
    })
  }

  // 清空等待队列
  clearQueue (currentState) {
    
    const doQueue = currentState === REJECTED ? this.catchQueue : this.thenQueue;
    const promiseData = this.getPromiseValue();

    doQueue.forEach(queueHandler=>queueHandler(promiseData));
    this.catchQueue = [];
    this.thenQueue = []
  }

  // 状态改变方法
  changeStateHandler (currentState, data){

    eventLoopEndRun(()=>{
      this.setPromiseState(currentState);
      this.setPromiseValue(data);
      this.clearQueue(currentState);

      // 保持状态只能改变一次
      this.setPromiseState = null;
      this.setPromiseValue = null;
    });

  }

  // 不解释
  resolve (data) {
    if(this.changeStateHandler){
      this.changeStateHandler(FULFILLED, data);
      // 保持状态只能改变一次
      this.changeStateHandler = null;
    }
  }
  // 不解释
  reject (err, noSubscribe) {
    if(this.changeStateHandler){ 
      this.changeStateHandler(REJECTED, err);
      !noSubscribe && !this.hascatch && promiseSubscribePublish.subscribe(this, err);
      // 存在 reject ，事件循环结束发布 UNHANDLEDREJECTION
      eventLoopEndRun(()=>
        promiseSubscribePublish.publish(PromiseSubscribePublish.UNHANDLEDREJECTION, this),
        true
      );
      // 保持状态只能改变一次
      this.changeStateHandler = null;
    }
  }

  // 不解释
  static resolve (data) {
    return new MyPromise(resolve=>resolve(data));
  }
  // 不解释
  static reject (err) {
    return new MyPromise((resolve, reject)=>{reject(err)});
  }

  static unhandledRejectionLisener(cb){
    promiseSubscribePublish.bindLisener(PromiseSubscribePublish.UNHANDLEDREJECTION ,cb)
  }
  static rejectionHandledLisener(cb){
    promiseSubscribePublish.bindLisener(PromiseSubscribePublish.REJECTIONHANDLED ,cb)
  }
  // 得传入一个生成器
  static all (promiseArr){
    
    
    
    // 因为是静态方法 无法获取 this 所以不能使用实例内部方法构建方式去构建新对象
    return new MyPromise((resolve,reject)=>{
      const iterator = isIterator(promiseArr);
      
      if(typeof iterator === 'string'){
        console.error(iterator);
        throw new Error(iterator);
      }

      let data = iterator.next();
      const result = [];
      let index = -1; // Promise 应存放返回数组的位置；
      let waitPromiseNum = 0; // 统计未完成的 Promise；
      
      let checkAllEnd = () => {
        return waitPromiseNum === 0;
      }

      while (data) {
        if(data.done) break;
        index ++;
        if(Object.prototype.toString.call(data.value) !== "[object MyPromise]"){
          result[index] = data.value;
        } else {

          (index=>{
            const promise = data.value; 
            waitPromiseNum++;
            promise.then(data=>{
              result[index] = data;
              waitPromiseNum--;
              // 看是否 Promise 全部完成
              if(checkAllEnd())resolve(result);
            }).catch(data=>reject(data));
          })(index)

        }
        data = iterator.next();
      }

      if(checkAllEnd())resolve(result);
    })
  }

  static race (promiseArr){
    
    
    
    // 因为是静态方法 无法获取 this 所以不能使用实例内部方法构建方式去构建新对象
    return new MyPromise((resolve,reject)=>{
      const iterator = isIterator(promiseArr);

      if(typeof iterator === 'string'){
        console.error(iterator);
        throw new Error(iterator);
      }

      let data = iterator.next();
      while (data) {
        if(data.done) break;
        if(Object.prototype.toString.call(data.value) !== "[object MyPromise]"){
          return resolve(data.value);
        } else {
          data.value
            .then(data=>resolve(data))
            .catch(data=>reject(data));
        }
        data = iterator.next();
      }

    })
  }
  static get [Symbol.species](){
    return this
  }
  
  // 不解释
  then(thenHandler, quitReturn){
    
    const currentState = this.getPromiseState();
    const promiseData = this.getPromiseValue();
    let nextPromiseData;
    if (currentState === FULFILLED) eventLoopEndRun(()=>{
      nextPromiseData = runFucMaybeError(()=>thenHandler(promiseData))
    });
    else if (currentState === PENDDING) this.thenQueue.push(data=>{
      nextPromiseData = runFucMaybeError(()=>thenHandler(data))
    });

    if(!quitReturn){
      const nextPromise = new this.constructor[Symbol.species]((resolve,reject)=>{
        
        this.catch(err=>reject(err, true), true);
        // 根据队列原则，执行肯定在当前 then 后，保证能正确拿到前一个 Promise 的返回值
        this.then(()=>{
          nextPromiseData && nextPromiseData.iserror === FUCERROR 
            ? reject(nextPromiseData.err) 
              : resolve(nextPromiseData)
        }, true)
      })
      nextPromise.linkPrePromise = this;
      return nextPromise;
    };

  }

  // 不解释 ß
  catch(catchHandler, quitReturn){
    
    const currentState = this.getPromiseState();
    const promiseData = this.getPromiseValue();
    let nextPromiseData;
    // 取消当前事件循环下 reject 状态未 catch 事件订阅;
    // 当是实例内部调用时,不能将当前 Promise 从 unhandledReject 队列中移除；
    // 否则顺着生成链依次将 Promise 移除；
    if(!quitReturn)clearLinksSubscribe(this)
    if (currentState === REJECTED) {
      
      eventLoopEndRun(()=>{
        // 发布 catch 处理
        promiseSubscribePublish.publish(PromiseSubscribePublish.REJECTIONHANDLED, this);
        nextPromiseData = runFucMaybeError(()=>catchHandler(promiseData));
      });

    }
    else if (currentState === PENDDING) this.catchQueue.push(data=>{
      nextPromiseData = runFucMaybeError(()=>{catchHandler(data)})
    });

    if(!quitReturn){
      
      const nextPromise = new this.constructor[Symbol.species]((resolve,reject)=>{
        // 根据队列原则，执行肯定在当前 then 后，保证能正确拿到报错的 Promise 的返回值
        this.catch(()=>{
          nextPromiseData && nextPromiseData.iserror === FUCERROR 
          ? reject(nextPromiseData.err) 
            : resolve(nextPromiseData)
        }, true);
        this.then(data=>resolve(data), true)
      })
      nextPromise.linkPrePromise = this;
      return nextPromise;
    }

  }

}

// 新增标记

MyPromise.prototype[Symbol.toStringTag] = "MyPromise";

module.exports = MyPromise;