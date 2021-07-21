// Test

"use strict";

import { expect } from 'chai';
import { AsyncInterval } from "../src/index";

function waitMs(ms: number): Promise<void> {
    return new Promise<void>(function (resolve) {
        setTimeout(resolve, ms);
    })
}

describe("Async Interval", () => {

    it('Timing test', () => {
        return new Promise<void>((resolve, reject) => {
            let counter = 0;
            let start = Date.now();

            const interval = new AsyncInterval(async () => {
                counter++;

                try {
                    expect(Date.now()).to.be.greaterThanOrEqual(start + (100 * counter));
                } catch (e) {
                    reject(e);
                }
                
                await waitMs(50);

                if (counter === 5) {
                    interval.stop();
                    resolve();
                } else if (counter === 2) {
                    throw new Error("Test exception");
                }
            }, 100);

            interval.addListener("error", err => {});

            interval.start();
        });
    });

    it('Timing test (with first run)', () => {
        return new Promise<void>((resolve, reject) => {
            let counter = 0;
            let start = Date.now();

            const interval = new AsyncInterval(async () => {
                expect(Date.now()).to.be.greaterThanOrEqual(start + (100 * counter));

                counter++;

                await waitMs(50);

                if (counter === 5) {
                    interval.stop();
                    resolve();
                } else if (counter === 2) {
                    throw new Error("Test exception");
                }
            }, 100);

            interval.addListener("error", err => {});
            interval.start(true);
        });
    });


    it('Destroy before first run', () => {
        return new Promise<void>((resolve, reject) => {
            let interval: AsyncInterval;

            setTimeout(function () {
                interval.stop();
                resolve();
            }, 100);

            interval = new AsyncInterval(async () => {
               reject(new Error("Function called after destroyed"));
            }, 200);

            interval.start();
        });
    });

    it('Destroy after first run', () => {
        return new Promise<void>((resolve, reject) => {
            let interval: AsyncInterval;
            let counter = 0;

            interval = new AsyncInterval(async () => {
                interval.stop();
                try {
                    expect(counter).to.be.eq(0);
                } catch (e) {
                    return reject(e);
                }
                counter++;
                setTimeout(function () {
                    resolve();
                }, 150);
            }, 100);

            interval.start();
        });
    });
});
