// Async Semaphore

"use strict";

interface Waiter {
    resolve: () => any;
    reject: (err: Error) => any;
    requiredInstances: number;
}

/**
 * Async semaphore
 * To create critical sections of async functions
 */
export class AsyncSemaphore {
    // Free Instances
    private instances: number;

    // Waiting queue
    private waiting: Waiter[];

    private destroyed: boolean;

    /**
     * Constructor
     * @param instances Initial number of instances 
     */
    constructor(instances?: number) {
        if (instances === undefined) {
            this.instances = 1;
        } else {
            this.instances = instances;
        }
        this.waiting = [];
        this.destroyed = false;
    }

    /**
     * Acquire instances
     * @param instances Number of instances
     */
    public async acquire(instances?: number) {
        if (instances === undefined) {
            instances = 1;
        }

        if (this.destroyed) {
            throw new Error("The semaphore is destroyed");
        }

        if (this.instances >= instances && this.waiting.length === 0) {
            // Can be adquired
            this.instances -= instances;
        } else {
            return new Promise<void>((resolve, reject) => {
                // Add to queue
                this.waiting.push({
                    requiredInstances: instances,
                    resolve: resolve,
                    reject: reject,
                })
            });
        }
    }

    /**
     * Release instances
     * @param instances Number of instances
     */
    public release(instances?: number) {
        if (instances === undefined) {
            instances = 1;
        }

        if (this.destroyed) {
            return;
        }

        this.instances += instances;

        // Release waiters
        while(this.waiting.length > 0 && this.waiting[0].requiredInstances <= this.instances) {
            const waiter = this.waiting.shift();
            this.instances -= waiter.requiredInstances;
            waiter.resolve();
        }
    }

    /**
     * Destroys the semaphore.
     * All functions waiting for it will receive a promise rejection.
     */
    public destroy() {
        this.destroyed = true;
        this.waiting.forEach(waiter => {
            waiter.reject(new Error("The semaphore is destroyed"))
        });
        this.waiting = [];
    }
}
