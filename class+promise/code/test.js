const MyPromise = require('./MyPromise.js');
// const test1 = new MyPromise((resolve,reject)=>{
//   setTimeout(()=>{
//     resolve('2s 后输出了我');
//   }, 2000)
// });

// const test2 = new MyPromise((resolve,reject)=>{
//     reject('我出错啦！')
// })

// test1.then(data=>console.log(data));
// test1.catch(err=>console.log(err));
// test2.then(data=>console.log(data));
// test2.catch(err=>console.log(err));
// console.log("我是最早的");

// var resolvePromise =  MyPromise.resolve(111);

// resolvePromise.then(data=>console.log(data));

// var rejectPromise =  MyPromise.reject('这个错了');

// rejectPromise.catch(data=>console.log(data));

// new MyPromise();

// var errPromise = new MyPromise(()=>{throw new Error("我错了")});
// errPromise.catch(data=>console.log(data.message));

// process.on('unhandledRejection',function(r,p){
//   console.log(r,p)
// })
// var rejj = Promise.reject();
// process.on('rejectionHandled',function(r,p){
//   console.log(123)
// })

// eventLoopEndRun(()=>{
//   rejj.catch(()=>{
//     console.log(11)
//   })
// }) 



// let rejected;

// process.on('unhandledRejection',function(event){
// 	console.log('onunhandledrejection');
// })

// process.on('rejectionHandled',function(event){
// 	console.log('onrejectionhandled');
// })

// rejected = Promise.reject(new Error('xx'))

// eventLoopEndRun(()=>{
//   console.log(123);
//   rejected.catch(err=>{
//     console.log(err.message)
//   })
//   rejected.catch(err=>{
//     console.log(err.message)
//   })
// })


// MyPromise.unhandledRejectionLisener((err,promise)=>{
//   console.log(err, promise);
// }) 
// MyPromise.rejectionHandledLisener((err,promise)=>{
//   console.log(err, promise);
// }) 
// var myPromise = MyPromise.reject(11);
// // myPromise.catch(()=>{console.log('catch')});
// setTimeout(()=>{
//   myPromise.catch(()=>{console.log('catch')});
// },1000)

// MyPromise.unhandledRejectionLisener((err,promise)=>{
//   console.log(err, promise);
// }) 
// const test1 = new MyPromise((resolve,reject)=>{
//   setTimeout(()=>{
//     resolve('2s 后输出了我');
//   }, 2000)
// });


// test1.then(data=>{
//   console.log(data);
//   return '你好'
// }).then(data=>{
//   console.log(data);
//   return '不好'
// }).then(data=>{
//   console.log(data);
// });

// test1.catch(err=>console.log(err)).then(data=>{
//   console.log(data);
//   return 'gggg'
// }).then(data=>{
//   console.log(data);
// });

// const test2 = new MyPromise((resolve,reject)=>{
//   throw new Error('xx');
// })

// test2.then(data=>console.log(data)).catch(err=>console.log(err));

// test2.catch(err=>console.log(err)).then(data=>{
//   console.log(data);
//   return '你好'
// }).then(data=>{
//   console.log(data);
//   return '不好'
// }).then(data=>{
//   console.log(data);
// });
// var a = MyPromise.resolve(1);
// var b = a.then(data=>{throw new Error('11')}).catch(err=>{console.log(err.message)})

// MyPromise.reject(1)

// MyPromise.all([MyPromise.resolve(1),new MyPromise(resolve=>setTimeout(()=>resolve(2), 1000)),MyPromise.resolve(3)]).then(data=>{console.log(data)});
// MyPromise.all([1,new MyPromise(resolve=>setTimeout(()=>resolve(2), 1000)),MyPromise.resolve(3)]).then(data=>{console.log(data)});
// MyPromise.all([MyPromise.resolve(1),new MyPromise(resolve=>setTimeout(()=>resolve(2), 1000)),MyPromise.reject(3)]).then(data=>{console.log(data)});


// MyPromise.race([MyPromise.resolve(1),new MyPromise(resolve=>setTimeout(()=>resolve(2), 1000)),MyPromise.resolve(3)]).then(data=>{console.log(data)});
// MyPromise.race([1,new MyPromise(resolve=>setTimeout(()=>resolve(2), 1000)),MyPromise.resolve(3)]).then(data=>{console.log(data)});
// MyPromise.race([MyPromise.resolve(1),new MyPromise(resolve=>setTimeout(()=>resolve(2), 1000)),MyPromise.reject(3)]).then(data=>{console.log(data)});
