// Test

"use strict";

import { AsyncSemaphore } from '../src';

function waitMs(ms: number): Promise<void> {
    return new Promise<void>(function (resolve) {
        setTimeout(resolve, ms);
    })
}

describe("Async Semaphore", () => {
    it('Prevents race conditions', () => {
        return new Promise<void>((resolve, reject) => {
            let counter = 0;
            let sem = new AsyncSemaphore();

            async function increment() {
                await sem.acquire()

                let temp = counter;

                await waitMs(20);

                temp++;

                counter = temp;

                sem.release();
            }

            let p1 = increment();
            let p2 = increment();
            let p3 = increment();
            let p4 = increment();

            Promise.all([p1, p2, p3, p4]).then(() => {
                if (counter === 4) {
                    resolve();
                } else {
                    reject(new Error(`Counter expected to be 4, but found ${counter}`));
                }
            });
        });
    });

    it('Should not be able to acquire if the semaphore is destroyed', () => {
        return new Promise<void>((resolve, reject) => {
            let destroyed = false;
            let sem = new AsyncSemaphore(0);

            async function testAcquire() {
                try {
                    await sem.acquire();
                } catch (ex) {
                    if (destroyed) {
                        if (ex.message === "The semaphore is destroyed") {
                            return;
                        } else {
                            throw ex;
                        }
                    } else {
                        throw new Error("The semaphore wasn't destroyed yet");
                    }
                }
                
                throw new Error("Entered the critical section without available instances");
            }

            let p1 = testAcquire();
            let p2 = testAcquire();
            let p3 = testAcquire();
            let p4 = testAcquire();

            waitMs(50).then(() => {
                Promise.all([p1, p2, p3, p4]).then(() => {
                    resolve();
                }).catch(reject);
                destroyed = true;
                sem.destroy();
            });
        });
    });
});
