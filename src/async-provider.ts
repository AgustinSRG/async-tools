// Async provider

"use strict";

type ResolveFunc<T> = (t: T) => void;
type RejectFunc = (err: Error) => void;

// Error to indicate timeout
class TimeoutError extends Error {
    constructor(msg?: string) {
        super(msg || "Timeout")
    }
}

/**
 * Async provider
 * Allows a value to be provider asynchronously, with a timeout
 */
export class AsyncProvider<T = any> {
    /**
     * Checks if an error is a timeout error
     * @param e The error
     * @returns True if the error is a timeout error
     */
    public static isTimeoutError(e: Error): boolean {
        return e instanceof TimeoutError;
    }

    // Promise
    private promise: Promise<T>;

    // True if the value was provided, or the timeout was reached
    private done: boolean;

    // Number of milliseconds until timeout
    private timeoutMs: number;

    // Reference to the timeout to cancel it
    private timeout?: number | NodeJS.Timeout;

    // Promise resolve
    private onResolve?: ResolveFunc<T>;

    // Promise reject
    private onReject?: RejectFunc;

    // Value
    private value?: T;

    // Error
    private error?: Error;

    /**
     * Constructor for AsyncProvider
     * @param timeout Number of milliseconds until timeout
     */
    constructor(timeout?: number) {
        this.timeoutMs = timeout;
        this.reset();
    }

    /**
     * Obtains the provided value (Async)
     * May throw if the timeout is reached or an error is provided
     * @returns A promise for the provided value
     */
    public getValue(): Promise<T> {
        return this.promise;
    }

    /**
     * Provides the value
     * @param value The value
     */
    public provideValue(value: T) {
        if (this.done) {
            return;
        }

        this.done = true;

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        if (this.onResolve) {
            this.onResolve(value);
        } else {
            this.value = value;
        }
    }

    /**
     * Provides an error
     * @param error The error
     */
    public provideError(error: Error) {
        if (this.done) {
            return;
        }

        this.done = true;

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        if (this.onReject) {
            this.onReject(error);
        } else {
            this.error = error;
        }
    }

    /**
     * Checks if the provider is done
     * @returns True if the value or error was already provided
     */
    public isDone(): boolean {
        return this.done;
    }

    /**
     * Resets the provider, setting it to the same status it was after constructing it
     */
    public reset() {
        this.done = false;

        this.value = undefined;
        this.error = undefined;

        this.onReject = undefined;
        this.onResolve = undefined;

        this.promise = new Promise<T>((resolve, reject) => {
            this.onResolve = resolve;
            this.onReject = reject;

            if (this.done) {
                if (this.error) {
                    reject(this.error);
                } else {
                    resolve(this.value);
                }
            }
        });

        if (this.timeoutMs) {
            this.timeout = setTimeout(() => {
                this.timeout = null;

                if (this.done) {
                    return;
                }

                this.done = true;

                if (this.onReject) {
                    this.onReject(new TimeoutError());
                } else {
                    this.error = new TimeoutError();
                }
            }, this.timeoutMs);
        }
    }
}
