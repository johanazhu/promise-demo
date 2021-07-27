
// 1.
// const MyPromise = require('./MyPromise')

// const promise = new MyPromise((resolve, reject) => {
//    resolve('success')
//    reject('err')
// })

// promise.then(value => {
//   console.log('resolve', value)
// }, reason => {
//   console.log('reject', reason)
// })
// 2.0

// const MyPromise = require('./MyPromise')
// const promise = new MyPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('success')
//   }, 2000); 
// })

// promise.then(value => {
//   console.log(1)
//   console.log('resolve', value)
// })
 
// promise.then(value => {
//   console.log(2)
//   console.log('resolve', value)
// })

// promise.then(value => {
//   console.log(3)
//   console.log('resolve', value)
// })
// 3.0
// const MyPromise = require('./MyPromise')
// const promise = new MyPromise((resolve, reject) => {
//   // 目前这里只处理同步的问题
//   resolve('success')
// })

// function other () {
//   return new MyPromise((resolve, reject) =>{
//     resolve('other')
//   })
// }
// promise.then(value => {
//   console.log(1)
//   console.log('resolve', value)
//   return other()
// }).then(value => {
//   console.log(2)
//   console.log('resolve', value)
// })
// 4.0
// const promise = new Promise((resolve, reject) => {
//     resolve(100)
//   })
//   const p1 = promise.then(value => {
//     console.log(value)
//     return p1
//   })
// 5.0
// const MyPromise = require('./MyPromise')
// const promise = new MyPromise((resolve, reject) => {
//     resolve('success')
// })
 
// // 这个时候将promise定义一个p1，然后返回的时候返回p1这个promise
// const p1 = promise.then(value => {
//    console.log(1)
//    console.log('resolve', value)
//    return p1
// })
 
// // 运行的时候会走reject
// p1.then(value => {
//   console.log(2)
//   console.log('resolve', value)
// }, reason => {
//   console.log(3)
//   console.log(reason.message)
// })
// 6.0
// const MyPromise = require('./MyPromise')
// const promise = new MyPromise((resolve, reject) => {
//     resolve('success')
//     // throw new Error('执行器错误')
//  })
 
// // 第一个then方法中的错误要在第二个then方法中捕获到
// promise.then(value => {
//   console.log(1)
//   console.log('resolve', value)
//   throw new Error('then error')
// }, reason => {
//   console.log(2)
//   console.log(reason.message)
// }).then(value => {
//   console.log(3)
//   console.log(value);
// }, reason => {
//   console.log(4)
//   console.log(reason.message)
// })

// 7.0.1
// const MyPromise = require('./MyPromise')
// const promise = new MyPromise((resolve, reject) => {
//   resolve('succ')
// })
 
// promise.then().then().then(value => console.log(value))


// 7.0.2
// const MyPromise = require('./MyPromise')
// const promise = new MyPromise((resolve, reject) => {
//   reject('err')
// })
 
// promise.then().then().then(value => console.log(value), reason => console.log(reason))

