// Async interval

"use strict";

import { EventEmitter } from "events";

export declare interface AsyncInterval {
    /**
     * Adds error event handler
     * @param eventName Event name
     * @param handlerFunc Handler function
     */
    on(eventName: "error", handlerFunc: (err: Error) => void): this;
}

/**
 * Interval that waits for async functions to complete
 */
export class AsyncInterval extends EventEmitter {
    public interval: NodeJS.Timeout;
    public busy: boolean;

    public ms: number;
    public func: () => any;

    /**
     * Constructor
     * @param func Async function to run
     * @param ms Milliseconds between each execution 
     */
    constructor(func: () => any, ms: number) {
        super();

        this.func = func;
        this.ms = ms;

        this.busy = false;
        this.interval = null;
    }

    /**
     * Starts the interval
     * @param runFirst true to run the first time immediately after start
     */
    public start(runFirst?: boolean) {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(this.tick.bind(this), this.ms);
        if (runFirst) {
            this.tick();
        }
    }

    /**
     * Stops the interval
     */
    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Clears the interval
     * Same as .stop()
     */
    public clear() {
        this.stop();
    }

    private async tick() {
        if (this.busy) {
            // If already running, wait for
            // the async function to end
            return;
        }
        this.busy = true;
        try {
            const res = this.func();
            if (res instanceof Promise) {
                // If returns promise, wait for it
                await res;
            }
        } catch (ex) {
            this.emit('error', ex);
        }
        this.busy = false;
    }
}
