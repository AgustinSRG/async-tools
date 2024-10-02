# Async tools

[![npm version](https://badge.fury.io/js/%40asanrom%2Fasync-tools.svg)](https://badge.fury.io/js/%40asanrom%2Fasync-tools)

Collection of tools to work with async functions in javascript.

## Installation

If you are using a npm managed project use:

```
npm install @asanrom/async-tools
```

If you are using it in the browser, download the minified file from the [Releases](https://github.com/AgustinSRG/async-tools/tags) section and import it to your html:

```html
<script type="text/javascript" src="/path/to/async-tools.js"></script>
```

The browser library exports all artifacts to the window global: `AsyncTools`

## Async Interval

Interval that waits for the async function to end before running it again. Prevent multiple simultaneous executions.

Example use case: Async periodic task

Usage:

```ts
import { AsyncInterval } from "@asanrom/async-tools";

const interval = new AsyncInterval(async function () {
    await doSomethingAsync();
}, 1000 /* Milliseconds */);

interval.on("error", error => {
    // If the promise is rejected it will emit
    // and error event. If you want the interval to continue
    // when this happens, you have to assign an error handler
    console.error(error);
});

interval.start(); // Start the interval

interval.stop(); // Stops / Clears the interval
```

## Async Queue

Queue with an async item handler.

 - Items are handled in order (FIFO)
 - If the handler is an async function, it waits for it to finish before dispatching the next item

Usage:

```ts
import { AsyncQueue } from "@asanrom/async-tools";

const queue = new AsyncQueue(
    MAX_SIZE, // Max size of the queue or 0 for unlimited size
    async function (item) { // Item handler
        await doSomethingAsync(item)
    }
);

queue.on("error", error => {
    // If the promise is rejected it will emit
    // and error event. If you want the queue to continue
    // when this happens, you have to assign an error handler
    console.error(error);
});

const items = [1, 2, 3, 4];
items.forEach(item => {
    // Use push(item) to push items to the queue
    // They will be dispatched automatically
    // Push will return false if the item was dropped
    queue.push(item);
});

// We can check the size of the queue (number of items in it)
queue.getCurrentSize();

// Also we can check if it's full
queue.isFull();

// If we want to release the resources of the queue
// we can call destroy()
// It returns a promise that waits if there is an item
// in the mid of being handled
await queue.destroy();
```

## Async Semaphore

Semaphore to create critical sections on async functions.

Usage:

```ts
import { AsyncSemaphore } from "@asanrom/async-tools";


const sem = new AsyncSemaphore(); // Without params, initial instances is 1 (Mutex)
const sem3Instances = new AsyncSemaphore(3); // 3 initial instances

// Acquire instances, if it can't acquire
// the promise will resolve when the instances are available
// it will reject if the semaphore is destroyed
await sem.acquire();

// Release instances and resolve the promises
sem.release();

// Rejects all promises waiting to acquire the semaphore
// After destroyed, it cannot be used anymore
sem.destroy();
```

## Async Provider

Provides values asynchronously, allowing a function to await the value while other function eventually provides the value.

It also provides a timeout option to set a max time to wait for the value.

Usage:

```ts
import { AsyncProvider } from "@asanrom/async-tools";

// Create a provider
const provider = new AsyncProvider(2000 /* Timeout in milliseconds as the constructor argument */);

server.on("message", msg => {
    // You can asynchronously provide a value.
    // For example, when an event is received
    provider.provideValue(msg);
});


server.on("error", err => {
    // You can also asynchronously provide an error
    provider.provideError(err);
});

try {
    // You can await for the value
    // The promise will be resolved if 'provideValue' is called on time
    // The promise will reject if the timeout is reached or 'provideError' is called
    const value = await provider.getValue();

    console.log("Value: " + value);
} catch (ex) {
    if (AsyncProvider.isTimeoutError(ex)) { // Check if the error is a timeout error
        // Timeout error
        console.error("The value was not provided in time!");
    } else {
        // Provided error
        console.error(ex);
    }
}
```

## Documentation

 - [Library documentation (Auto-generated)](https://agustinsrg.github.io/async-tools/)
