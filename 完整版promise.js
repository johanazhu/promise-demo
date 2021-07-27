
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

Promise.prototype.then = (onFulfilled, onRejected) => {
    return new Promise((resolve, reject) => {
        let callback = { onFulfilled, onRejected, resolve, reject }

        if(this.state === PENDING) {
            this.callbacks.push(callback)
        } else {
            setTimeout(() => handleCallback(callback, this.state, this.result), 0)  
        }
    })
}

const handleCallback = (callback, state, result) => {
    let { onFulfilled, onRejected, resolve, reject } = callback;

    try {
        if (state === FULFILLED) {
            isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result)
        } else if (state === REJECTED) {
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


const resolvePromise = (promise, result, resolve, reject) => {
    if (result === promise) {
        let reason = new TypeError('不能自己调自己')
        return reject(reason)
    }

    if (isPromise(result)) {
        return result.then(resolve, reject)
    }

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


Promise.prototype.catch = (onRejected) => this.then(null, onRejected)

Promise.resolve = value => new Promise(resolve => resolve(value));

Promise.reject = reason => new Promise((_, reject) => reject(reason));

// 等所有promise的resolve回调结束
Promise.all = (promises = []) => {
    return new Promise((resolve, reject) => {
        let count = 0;
        let values = Array.from({length: a.length}).fill()
        let collectValue = index => value => {
            values[index] = value;
            count += 1;
            count === promises.length && resolve(values)
        }
        promises.forEach((promise, i) => {
            if (isPromise(promise)) {
                promise.then(collectValue(i), reject)
            } else {
                collectValue(i)(promise)
            }
        })
    })
}
// 取最快的
Promise.race = (promises = []) => {
    return new Promise((resolve, reject) => {
        promises.forEach(promise => {
            if(isPromise(promise)) {
                promise.then(resolve, reject)
            } else {
                resolve(promise)
            }
        })
    })
}