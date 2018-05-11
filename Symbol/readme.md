# Symbol

### 什么是 Symbol
>Symbol 是 es6 引入第 6 种原始类型，用于创建必须通过 Symbol() 才能应用的对象属性，在解决一些重要属性命名冲突的使用上很有好处。

```javascript
  // 因为
  Symbol('a') === Symbol('a'); //false
    // 所以
  const key1 = Symbol('a');
  const oobject = {};
  oobject[key1] = '我不会轻易被修改喔';
  oobject[Symbol('a')] = '我要修改你';
  console.log(oobject[key1]); //'我不会轻易被修改喔'
```
### Symbol 共享

>前面说了 Symbol 不容易被轻易修改。现在有个酱紫的场景，我在 a、b 两个作用域木有交集的场景但是我想用同样一个 Symbol 作为变量属性咋办呢？Symbol 提供了一个全局注册表,使用方式就是 Symbol.for()。码上说

```javascript
  const oobeject = {};
  function a(){
    return Symbol.for('leee')
  }
  function b(){
    return Symbol.for('leee')
  }
  const aSymbol = a();
  const bSymbol = b();
  oobeject[aSymbol] = '注册一波';
  console.log(oobeject[aSymbol], oobeject[bSymbol]);// '注册一波' * 2
  oobeject[b()] = '改一波';
  console.log(oobeject[aSymbol], oobeject[bSymbol]);// '改一波' * 2
  // Symbol.for 就是，当全局注册表里没这玩意儿，就加进去表里，不然就返回表里的 Symbol 值
```

### Symbol 其他

* 识别用---```typeof```
* 强制类型转换---Symbol 木有与其他类型等价的值，在运算中使用数据操作符会报错滴，但是逻辑预算符阔以，其等价于 ```true```;

### well-know Symbol

>es6开放了一些 js 常见滴的内部操作，并在主要原型链上预定义了一些 well-know Symbol 标识

* Symbol.hasInstance --->>> instanceof

```javascript
  function iitest(){}
  // 这里注意啦，必须用 defineProperty,直接通过 prototype 改不动喔。不信可以自己 trytry
  Object.defineProperty(iitest, Symbol.hasInstance, {
    value:v=>false
  })
  let iObj = new iitest();
  console.log(iObj instanceof iitest)//false;
```

* Symbol.isConcatSpreadable 数组拼接时是否分解

>es6以前，凡是传入了数组作为参数，函数会把他们分解成独立的元素。现在可以通过修改这个属性，能有效简化其默认特性，与其他 Symbol 属性不同这是一个可选属性，因此可以在对象中直接赋值；

```javascript
// 元素concat时防止被分解
  let collection = {
    0: 'nihao',
    1: 'buhao',
    length: 2,
    [Symbol.isConcatSpreadable]: false
  }
  console.log(['不会被拆掉'].concat(collection));// ['不会被拆掉',{}]
  let collection = {
    0: 'nihao',
    1: 'buhao',
    length: 2,
    [Symbol.isConcatSpreadable]: true
  }
  console.log(['会被拆掉'].concat(collection));// ['会被拆掉','nihao','buhao']
```

* Symbol.match/replace/search/split

```javascript
// 这是一波字符串操作
let strOperation = {
  [Symbol.match]: val => 'match',
  [Symbol.replace]: (val,replacement) => 
  'replace'+replacement,
  [Symbol.search]: val => 'search',
  [Symbol.split]: val => 'match'
}
let str = '无所谓叫啥';
str.match(strOperation);//match
str.replace(strOperation, 'what');//replacewhat
str.search(strOperation);//search
str.split(strOperation);//split
```

* Symbol.toPrimitive

>这涉及到强制类型转换,标准对象会有 number/string/default 三种

```javascript
function test(){
  this.name = '测试'
}
test.prototype[Symbol.toPrimitive] = function (hint) {
  switch(hint){
    case 'number':
      return 10
    case 'string':
      return this.name
    case 'default':
      return 'default'
  }
}
let testt = new test();
console.log(testt / 2);// 5
console.log(testt + '!');// default
console.log(String(testt));// 测试
```
* Symbol.toStringTag

> 修改标记 Object.prototype.toString.call

```javascript
  function test(){}
  test.prototype[Symbol.toStringTag] = 'PP'
  console.log(Object.prototype.toString.call(new test()))//[object PP]
```