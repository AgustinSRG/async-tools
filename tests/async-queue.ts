// Test

"use strict";

import { AsyncQueue } from '../src';

function waitMs(ms: number): Promise<void> {
    return new Promise<void>(function (resolve) {
        setTimeout(resolve, ms);
    })
}

describe("Async Queue", () => {
    it('Items are dispatched in order', () => {
        let counter = 0;
        let items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        return new Promise<void>((resolve, reject) => {
            const q: AsyncQueue = new AsyncQueue<number>(0, async (item) => {
                if (items[counter] !== item) {
                    q.destroy();
                    return reject(new Error(`Expected ${items[counter]} but found ${item}`));
                }

                await waitMs(20);

                counter++;

                if (counter === items.length) {
                    resolve();
                }
            });

            q.on('error', err => {
                console.error(err);
            });

            items.forEach(i => {
                q.push(i);
            });
        });
    });

    it('Error handler works', () => {
        let counter = 0;
        let items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        return new Promise<void>((resolve, reject) => {
            const q: AsyncQueue = new AsyncQueue<number>(0, async (item) => {
                if (items[counter] !== item) {
                    q.destroy();
                    return reject(new Error(`Expected ${items[counter]} but found ${item}`));
                }

                await waitMs(20);

                counter++;

                if (counter === items.length) {
                    resolve();
                } else {
                    // Throw test exception
                    throw new Error("Test error");
                }
            });

            q.on('error', err => { });

            items.forEach(i => {
                q.push(i);
            });
        });
    });

    it('No items are handled after destroy is called', () => {
        let items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let destroyed = false;

        return new Promise<void>((resolve, reject) => {
            const q: AsyncQueue = new AsyncQueue<number>(0, async (item) => {
                if (destroyed) {
                    reject(new Error("Item handled after destroy"));
                    return;
                }

                await waitMs(20);
            });

            q.on('error', err => {
                console.error(err);
            });

            setTimeout(async () => {
                await q.destroy();
                destroyed = true;
                setTimeout(() => {
                    resolve();
                }, 50);
            }, 50);

            items.forEach(i => {
                q.push(i);
            });
        });
    });


    it('Queue size limit is respected', () => {
        let items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let destroyed = false;

        return new Promise<void>((resolve, reject) => {
            const q: AsyncQueue = new AsyncQueue<number>(5, async (item) => {
                if (destroyed) {
                    reject(new Error("Item handled after destroy"));
                    return;
                }

                await waitMs(20);

                if (q.getCurrentSize() === 0) {
                    resolve();
                }
            });

            q.on('error', err => {
                console.error(err);
            });

            items.forEach(i => {
                const pushed = q.push(i);
                if (i > 5) {
                    if (pushed) {
                        reject(new Error("Size limit was bypassed"));
                    }
                } else {
                    if (!pushed) {
                        reject(new Error("Item dropped but size limit not reached yet"));
                    }
                }
            });
        });
    });
});
