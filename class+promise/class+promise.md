# 用 class 写法实现一个 *Promise*

## 1.*Promise* 特征分析

* *Promise* 有三种状态： pending(执行中)、 fulfilled(成功执行)、settled(异常捕获);
* *Promise* 可以通过 new 关键字创建一个 未完成的 *Promise*;
* *Promise* 可以直接通过 *Promise*.resolve 创建一个成功完成的 *Promise* 对象;
* *Promise* 可以直接通过 *Promise*.reject 创建一个异常状态的 *Promise* 对象;
* 通过 new 关键字创建的 *Promise* 方法里如果出现错误，会被 *Promise* 的 reject 捕获;
* *Promise*.resolve / *Promise*.reject 接收 thenable 对象和 *Promise* 对象的处理方式;
* 当没有错误处理时的，全局的 *Promise* 拒绝处理;
* 串联 *Promise* 以及 *Promise* 链返回值;
* *Promise*.all *Promise*.race;

## 2.*Promise* 的实现

* ### 状态码私有化

  开始之前讨论一波 class 私有属性的实现，个人想到的方案如下：

  1.通过闭包,将变量存放在 construct 方法里；弊端，所有的其他的对象方法必须在 construct 内定义(NO)。

  2.通过在定义 *Promise* 的环境下定义一个 Map，根据当前对象索引去获取相应的私有值；弊端，因为 Map 的 key 是强引用，当定义的 *Promise* 不用时也不会被内存回收(NO)；

  3.通过在定义 *Promise* 的环境下定义一个 WeakMap，根据当前对象索引去获取相应的私有值； 优势，木有以上两种劣势（不写点什么感觉难受）；

  说了这么多那么咱们要用第三种方法吗？NO，原生 [[PromiseState]] 是一个内部属性，不暴露在 *Promise* 上，但是通过浏览器的控制台可以看到，用第三种方式模仿并不能直观的在控制台看到，所以我决定还是不要作为私有变量出现，但是把枚举特性干掉了 *假装他是私有变量* ~~心里好过一点~~ 因此你就能看到下面的代码;

```javascript

const PENDDING = 'pendding';// 等待状态
const FULFILLED = 'resolved';// 成功操作状态
const REJECTED = 'rejected';// 捕获错误状态

class MyPromise{
  
  constructor(handler){
    // 数据初始化
    this.init();
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
}

```


* ### 创建一个未完成状态的*Promise*

  函数调用过程分析：

  1. 使用者通过 new 关键字传入一个方法；
  2. 方法有两个参数 ```resolve``` 和 ```reject``` 两个方法
  3. 当传入的方法调用 ```resolve``` 时，状态变为 fulfilled，有且只有接收一次 ```resolve``` 里的方法里的值作为 ```[[PromiseValue]]```，供该 *Promise* 对象下的 ```then``` 方法使用；
  4. 当传入的方法调用 ```reject``` 时，状态变为 rejected，有且只有接收一次 ```reject``` 里的方法里的值作为 ```[[PromiseValue]]```，供该 *Promise* 对象下的 ```catch``` 方法使用；
  
  代码思路：
  1. 首先传入的函数应该在 construct 方法里进行调用；
  2. 因具备一个存放待执行成功操作方法的队列，一个存放捕获异常方法的队列。
  3. ```resolve``` 方法下处理的问题是：
    
      1、判断当前状态是否是等待状态，如果不是则啥也不干，如果是走第二步
      
      2、修改```[[PromiseState]]```为FULFILLED;
      
      3、将 ```[[PromiseValue]]``` 赋值为方法传递进来的参数； 
      
      4、成功操作方法的队列在 eventloop 结束后依次调用然后清空，捕获异常方法的队列清空；
  4. ```reject``` 方法基本就不赘述啦......
  5. ```then``` 方法：

      1、 判断当前状态是否为等待，是等待进行第 2 步，否则进行第 3 步；

      2、 加入成功操作方法队列；

      3、 当前eventloop 结束异步调用；
  5. ```catch``` 方法不赘述
  
```javascript
  // 事件循环最后执行
  const eventLoopEndRun = function (handler){
    setImmediate(()=>{
      handler()
    })
  }
  // ...

  class MyPromise{
  
    constructor(handler){
      // ...
      
      // 方法传递，通过 bind 保持两个方法对当前对象的引用
      handler(this.resolve.bind(this), this.reject.bind(this));
    }

    // ...

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
      setImmediate(()=>{this.clearQueue(currentState)});
      
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

  // 测试方法


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
  console.log("我是最早的");

```