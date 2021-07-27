const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromise(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
        if (this.state === PENDING) {
            this.state = FULFILLED;
            this.value = value;
            while(this.onFulfilledCallbacks.length) {
                this.onFulfilledCallbacks.shift()()
            }
        }
    } 

    const reject = (reason) => {
        if (this.state === PENDING) {
            this.state = REJECTED;
            this.reason = reason;
            while(this.onRejectedCallbacks.length) {
                this.onRejectedCallbacks.shift()()
            }
        } 
    }

    try {
        executor(resolve, reject)
    } catch (error) {
        reject(error)
    }
}


// 静态方法
MyPromise.resolve = value => new MyPromise(resolve => resolve(value))

MyPromise.reject = reason => new MyPromise((_, reject) => reject(reason))

MyPromise.all = function (promises) {
    return new MyPromise((resolve, reject) => {
        if (promises.length == 0) {
            resolve([])
        } else {
            let result = [];
            let index = 0;
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(data => {
                    result[i] = data;
                    if (++index === promises.length) {
                        resolve(result)
                    }
                }, err => {
                    reject(err);
                    return;
                })
            }
        }
    })
}

MyPromise.race =function(promises) {
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            resolve()
        } else {
            let index = 0;
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(data => {
                    resolve(data)
                }, err => {
                    reject(err);
                    return;
                })
            }
        }
    })
}

// 解决链式调用问题 p1.then( return p1).then(return 1).then(return new Promise(...))
function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('不能循环引用'))
    }
    if (typeof x === 'object' || typeof x === 'function') {
        if (x === null) {
            return resolve(x)
        }
        
        let then;
        try {
            then = x.then;
        } catch (error) {
            return reject(error)
        }
        
        if (typeof then === 'function') {
            let called = false;
            try {
                then.call(x, y=>{
                    if (called) return;
                    called = true;
                    resolvePromise(promise2, y, resolve, reject)
                }, r => {
                    if (called) return;
                    called = true;
                    reject(r)
                })
            } catch (error) {
                if (called) return;
                reject(error)
            }
        } else {
            resolve(x)
        }
    } else {
        resolve(x)
    }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    const promise2 = new Promise((resolve, reject) => {
        switch (this.state) {
            case FULFILLED:
                setTimeout(() => {
                    try {
                        const x =  onFulfilled(this.value);
                        resolvePromise(promise2, x,resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0)
                break;
            case REJECTED:
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason);
                        resolvePromise(promise2, x,resolve, reject)
                    } catch (error) {
                        reject(error)   
                    }
                }, 0)
                break;
            case PENDING:
                this.onFulfilledCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x =  onFulfilled(this.value);
                            resolvePromise(promise2, x,resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0)
                })
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.reason);
                            resolvePromise(promise2, x,resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0)
                })
                break;
        }
    })

    return promise2;
   
}


MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected)
}

MyPromise.prototype.finally = function(fn) {
    return this.then(value => {
        fn();
        return value
    }, reason => {
        fn();
        return reason;
    })
}

// 测试代码
MyPromise.deferred = function () {
    var result = {};
    result.promise = new MyPromise(function (resolve, reject) {
      result.resolve = resolve;
      result.reject = reject;
    });
  
    return result;
}


module.exports = MyPromise