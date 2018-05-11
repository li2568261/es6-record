const PENDDING = 'pendding';
const FULFILLED = 'resolved';
const REJECTED = 'rejected';
class MyPromise{
  
  constructor(handler){
    // 数据初始化
    this.init();
    
    // 方法传递，this指向会变，通过 bind 保持两个方法对当前对象的引用
    // 当然也可以这么玩：data=>this.resolve(data)
    handler(this.resolve.bind(this), this.reject.bind(this));

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

    this.setPromiseState(currentState);
    this.setPromiseValue(data);
    this.clearQueue(currentState);

    // 保持状态只能改变一次
    this.changeStateHandler = null;
    this.setPromiseState = null;
    this.setPromiseValue = null;
  }

  // 不解释
  resolve (data) {
    this.changeStateHandler && this.changeStateHandler(FULFILLED, data);
  }
  // 不解释
  reject (err) {
    this.changeStateHandler && this.changeStateHandler(REJECTED, err);
  }

  // 不解释
  then(thenHandler){
    
    const currentState = this.getPromiseState();
    const promiseData = this.getPromiseValue();

    if (currentState === FULFILLED) thenHandler(promiseData);
    else if (currentState === PENDDING) this.thenQueue.push(thenHandler);
  }

  // 不解释
  catch(catchHandler){
    
    const currentState = this.getPromiseState();
    const promiseData = this.getPromiseValue();

    if (currentState === REJECTED) catchHandler(promiseData);
    else if (currentState === PENDDING) this.catchQueue.push(catchHandler);
  }

}

console.log("我是最早的");

const test1 = new MyPromise((resolve,reject)=>{
  setTimeout(()=>{
    resolve('2s 后输出了我');
  }, 2000)
});

const test2 = new MyPromise((resolve,reject)=>{
  setTimeout(()=>{
    reject('我出错啦！')
  }, 2000)
})

test1.then(data=>console.log(data));
test1.catch(err=>console.log(err));
test2.then(data=>console.log(data));
test2.catch(err=>console.log(err));