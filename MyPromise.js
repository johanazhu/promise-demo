// MyPromise.js

// 先定义三个常量表示状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// 新建 MyPromise 类
class MyPromise {
    constructor(executor){
        executor(this.resolve, this.reject)
    }
    status = PENDING;
    value = null;
    reason = null;
    onFulfilledCallbacks = [];
    onRejectedCallbacks  = []

    resolve = (value) => {
        if (this.status === PENDING) {
            this.status = FULFILLED;
            this.value = value;
            while(this.onFulfilledCallbacks.length) {
                this.onFulfilledCallbacks.shift()(value)
            }
        }
    }

    reject = (reason) => {
        if (this.status === PENDING) {
            this.status = REJECTED;
            this.reason = reason;
            while(this.onRejectedCallbacks.length) {
                this.onRejectedCallbacks.shift()(reason)
            } 
        }
    }

    then(onFulfilled, onRejected) {

        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected ==='function' ? onRejected : reason => { throw reason}

        const promise2 = new Promise((resolve, reject) => {
            if (this.status === FULFILLED) {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject)                   
                    } catch (error) {
                        reject(error)
                    }
                })
            } else if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason); 
                        resolvePromise(promise2, x, resolve, reject)                  
                    } catch (error) {
                        reject(error)
                    }
                })
            } else if (this.status === PENDING) {
                this.onFulfilledCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject)                   
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.reason); 
                            resolvePromise(promise2, x, resolve, reject)                  
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
            }
        })

        return promise2;
    }

    // resolve 静态方法
    static resolve(parameter) {
        if (parameter instanceof MyPromise) {
            return parameter;
        } 
        return new MyPromise(resolve => {
            resolve(parameter)
        })
    }
    
    // reject 静态方法
    static reject(reason) {
        return new MyPromise((_, reject) => {
            reject(reason)
        });
    }
}

function resolvePromise(promise2, x, resolve, reject) {
     // 如果相等了，说明return的是自己，抛出类型错误并返回
    if (promise2 === x) {
        console.log('走这儿')
        return reject(new TypeError('不能自己调自己'))
    }
    if (typeof x === 'object' || typeof x === 'function') {
        if (x === null) {
            return resolve(x)
        }

        let then;
        try {
            then = x.then
        } catch (error) {
            return reject(error)            
        }
        if (typeof then === 'function') {
            let called = false;
            try {
                then.call(x, y=>{
                    if (called) return;
                    called = true;
                    resolvePromise(promise, y, resolve, reject)
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
        resolve(x);
    }

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
