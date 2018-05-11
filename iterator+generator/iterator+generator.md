# iterator+generator 处理异步问题

>这里不说迭代器和生成器概念，主要介绍通过 yield 的挂起机制把异步函数处理成同步函数的写法，旨在对 yield 加深理解。

* 我们来创造一个异步场景，期望下面执行是经过 1s 后执行第一次输出，然后再经过 1s 执行第二处输出

```javascript
  setTimeout(() => {console.log('我去经历了1000+ms')}, 1000)
  setTimeout(() => {console.log('我去又经历了1000+ms')}, 1000)
```
* 前面说到要用到 yield 的挂起机制首先想到的是这样一个格式

```javascript

  const iterator = (function *(){
    yield setTimeout(() => {console.log('我去经历了1000+ms')}, 1000)
    yield setTimeout(() => {console.log('我去又经历了1000+ms')}, 1000)
  })()

  iterator.next();
  iterator.next();

```

* 上面的代码显然是不对的，虽然能够正常的挂起程序，但是我们无法拿到异步完成的时间节点，如何能拿到这个异步完成的时间节点呢？我们需要把第一个异步处理成一个函数，然后把第二个异步过程放在一个函数内，等第一个异步函数执行完毕，通过回调的的方式执行第二个异步定时器。

```javascript

  const iterator = (function *(){
    yield cb => {
      setTimeout(() => {
        console.log('我去经历了1000+ms');
        cb();
      }, 1000)
    }
    yield setTimeout(() => {console.log('我去又经历了1000+ms')}, 1000)
  })();
  
  const resultFuc = iterator.next().value;
  resultFuc(()=>iterator.next());

```
* 顺序执行的目的达到了，但是很丑陋，我想做成一个执行器的程序体根据约定判断是否异步，让其自动执行。

```javascript

  const run = (iteratorDef)=>{
    
    const iterator = iteratorDef();
    // yield 返回的结果
    let result = iterator.next();
    // 单步执行,判断迭代器是否完成
    if (result.done) return;
    // yield 返回值会赋予 result.value
    if (typeof result.value === 'function') {
      result.value(()=>iterator.next())
    } else {
      iterator.next();
    }
  }

  run(function *(){
    yield cb => {
      setTimeout(() => {
        console.log('我去经历了1000+ms');
        cb();
      }, 1000)
    }
    yield setTimeout(() => {console.log('我去又经历了1000+ms')}, 1000)
  })
```
* 程序咋看之下感觉还 OK，但是我们如果再新增一个异步任务感觉又要改执行器了，这显然不是我们想看到的,程序体的多次执行咱们有两种思路一种是循环，一种是递归。循环直接 gg 了，可以实现就是再做一个生成器挂起程序，具体不详述，太繁琐，所以咱们用递归吧。

```javascript

  const run = (iteratorDef)=>{
    
    const iterator = iteratorDef();
    // yield 返回的结果
    let result = iterator.next();

    const step = ()=>{
      // 单步执行,判断迭代器是否完成
      if (result.done) return;
      // yield 返回值会赋予 result.value
      if (typeof result.value === 'function') {
        result.value(()=>{
          result = iterator.next();
          step();
        });
      } else {
        result = iterator.next();
        step();
      }
    }

    step();
  }

  run(function *(){
    yield cb => {
      setTimeout(() => {
        console.log('我经历了1000+ms');
        cb();
      }, 1000)
    }
    yield cb => {
      setTimeout(() => {
        console.log('我又经历了1000+ms');
        cb();
      }, 1000)
    }
    yield cb => {
      setTimeout(() => {
        console.log('我双经历了1000+ms');
        cb();
      }, 1000)
    }
  })

```

* 一般异步处理咱们需要接收返回数据这里就用到 iterator.next 方法接收的参数会替换上一次 yield 的返回值去处理，于是乎，咱们代码的最终版就是;
```javascript

  const run = (iteratorDef)=>{
    
    const iterator = iteratorDef();
    // yield 返回的结果
    let result = iterator.next();

    const step = ()=>{
      // 单步执行,判断迭代器是否完成
      if (result.done) return;
      // yield 返回值会赋予 result.value
      if (typeof result.value === 'function') {
        result.value(data => {
          result = iterator.next(data);
          step();
        });
      } else {
        result = iterator.next();
        step();
      }
    }

    step();
  }

  run(function *(){
    let result = yield cb => {
      setTimeout(() => {
        cb('我经历了1000+ms');
      }, 1000)
    }
    console.log(result);
    result = yield cb => {
      setTimeout(() => {
        cb('我又经历了1000+ms');
      }, 1000)
    }
    console.log(result);
    result = yield cb => {
      setTimeout(() => {
        cb('我双经历了1000+ms');
      }, 1000)
    }
    console.log(result);
  })

```
本文是读 *《深入理解es6》* 后的一篇读书笔记，主要描述通过 iterator+generator 处理异步问题，当然，还可以加上一些错误处理这里就不详述啦。 end........
