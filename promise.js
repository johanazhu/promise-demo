
const isFunction = obj => typeof obj === 'function';
const isPromise = obj => obj instanceof Promise;
const isObject = obj => !!(obj && typeof obj === 'object')
const isThenable = obj => (isFunction(obj) || isObject(obj)) && 'then' in obj;

const PENDING = Symbol('pending');
const FULFILLED = Symbol('fulfilled');
const REJECTED = Symbol('rejected')

function Promise(executor) {

    this.state = PENDING;
    this.result = null;
    this.callbacks = [];

    const onFulfilled = value => transition(this, FULFILLED, value)
    const onRejected = reason => transition(this, REJECTED, reason)

    let ignore = false;
    const resolve = value => {
        if (ignore) return
        ignore = true;
        resolvePromise(this, value, onFulfilled, onRejected)
    }


    const reject = reason => {
        if(ignore) return
        ignore = true
        onRejected(reason)
    }

    try {
        executor(resolve, reject)
    } catch (error) {
        reject(error)
    }
}

// then 方法的核心用途是：构建下一个 promise 的 result
// 因为 then 支持链式调用，所以就需要返回一个新的 promise 实例，再return出去
// 返回出去的 promise，有自己的 state 和 result，它们将由 onFulfilled 和 onRejected 的行为指定
// 为什么？
Promise.prototype.then = (onFulfilled, onRejected) => {
    return new Promise((resolve, reject) => {
        let callback = { onFulfilled, onRejected, resolve, reject }

        // 处理支持then
        if(this.state === PENDING) {
            this.callbacks.push(callback)
        } else {
            // 用 JS 模拟 Promises 的话，需要对压入执行栈的执行顺序问题
            setTimeout(() => handleCallback(callback, this.state, this.result), 0)  
        }
        // if (this.state === FULFILLED) {
        //     onFilfilled(this.result)
        // } else if (this.state === REJECTED) {
        //     onRejected(this.result)
        // } else if ( this.state === PENDING) {
        //     // Promise 中执行异步操作，then 要判断状态是否切换为成功或者失败，如果异步，那就先存起来
        //     this.callbacks.push(callback)
        // }
    })
}

const handleCallback = (callback, state, result) => {
    let { onFulfilled, onRejected, resolve, reject } = callback;

    try {
        if (state === FULFILLED) {
            isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result)
        } else if (state === REJECTED) {
            // 这里为什么是 resolve？
            // onRejected(result) 得到 onRejected(result) 执行后的结果值，是传递给下一个 then 的 resolve,如例1
            isFunction(onRejected) ? resolve(onRejected(result)) : reject(result)
        }   
    } catch (error) {
        reject(error)
    }
}

const handleCallbacks = (callbacks, state, result) => {
    while(callbacks.length) handleCallback(callbacks.shilt(), state, result)
}

const transition = (promise, state, result) => {
    if (promise.state !== PENDING) return;
    promise.state = state;
    promise.result = result;
    setTimeout(() => handleCallbacks(promise.callbacks, state, result), 0)
}

// 链式操作指南针
const resolvePromise = (promise, result, resolve, reject) => {
    // 避免循环引用
    if (result === promise) {
        let reason = new TypeError('不能自己调自己')
        return reject(reason)
    }

    // 链式调用
    if (isPromise(result)) {
        return result.then(resolve, reject)
    }

    // thenable 是一个包含 then 方法和对象或者函数。
    if (isThenable(result)) {
        try {
            let then = result.then
            if(isFunction(then)) {
                return new Promise(then.bind(result)).then(resolve, reject)
            }
        } catch (error) {
            reject(error)
        }
    }

    resolve(result)
}




// 例子1
// const promise1 = new Promise((resolve, reject) => {
//     resolve('success')
// })

// promise1.then((value) => {
//     console.log(1)
//     console.log('resolve', value)
//     return new Promise((resolve, reject) => {
//         reject('other')
//     })
// }).then((value) => {
//     console.log(2)
//     console.log('resolve', value)
// }, (error) => {
//     console.log('error', error)
// })