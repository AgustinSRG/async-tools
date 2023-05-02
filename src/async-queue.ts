// Async queue

"use strict";

import { EventEmitter } from "events";

export declare interface AsyncQueue<T = any> {
    /**
     * Adds error event handler
     * @param eventName Event name
     * @param handlerFunc Handler function
     */
    on(eventName: "error", handlerFunc: (err: Error) => void): this;

    /**
     * Adds item dropped event handler
     * @param eventName Event name
     * @param handlerFunc Handler function
     */
    on(eventName: "item-drop", handlerFunc: (item: T) => void): this;
}

/**
 * Async queue
 * Handles each item with an async function
 * Waits for the function to end before handling the next item
 * Allows a max size setting
 */
export class AsyncQueue<T = any> extends EventEmitter {

    // Config
    private size: number;
    private dispatchFunc: (t: T) => any;

    // Status
    private array: T[];
    private waiting: boolean;
    private toResolve: () => any;
    private destroyed: boolean;

    /**
     * Constructor
     * @param size Max size of the queue. Set to 0 for no size limit.
     * @param dispatchFunc Dispatch function
     */
    constructor(size: number, dispatchFunc: (t: T) => any) {
        super();

        this.array = [];
        this.size = size;
        this.dispatchFunc = dispatchFunc;
        this.waiting = true;
    }

    /**
     * @returns The current size of the queue
     */
    public getCurrentSize(): number {
        return this.array.length;
    }

    /**
     * @returns The max size allowed
     */
    public getMaxSize(): number {
        return this.size;
    }

    /**
     * Checks if the queue is full
     */
    public isFull(): boolean {
        return this.size > 0 && this.array.length >= this.size;
    }

    /**
     * Adds an item to the queue
     * @param item The item
     * @returns true if it was added, false if it was dropped
     */
    public push(item: T): boolean {
        if (this.destroyed) {
            this.emit('error', new Error("Push() was called after the queue was destroyed"));
            return;
        }

        if (this.isFull()) {
            this.emit('item-drop', item);
            return false;
        }

        this.array.push(item);

        if (this.waiting) {
            // If waiting (no items running) we can dispatch it
            this.dispatchNext();
        }

        return true;
    }

    /**
     * Destroys the queue
     */
    public async destroy(): Promise<void> {
        if (this.destroyed) {
            this.emit('error', new Error("Destroy() was called after the queue was destroyed"));
            return;
        }

        this.array = [];
        this.dispatchFunc = async function () { };

        // Wait if there is an item running
        return new Promise<void>(resolve => {
            if (this.waiting) {
                resolve();
            } else {
                this.toResolve = resolve;
            }
        });
    }

    private dispatchNext() {
        if (this.array.length > 0) {
            this.waiting = false;
            let result: any;

            try {
                result = this.dispatchFunc(this.array.shift());
            } catch (ex) {
                this.emit('error', ex);
            }

            if (result instanceof Promise) {
                result.then(this.dispatchNext.bind(this))
                    .catch(err => {
                        this.emit('error', err);
                        this.dispatchNext();
                    })
            } else {
                this.dispatchNext();
            }
        } else {
            this.waiting = true; // No more items yet

            // Resolve destroy promise if any
            if (this.toResolve) {
                try {
                    this.toResolve();
                } catch (ex) { }
                this.toResolve = null;
            }
        }
    }
}
