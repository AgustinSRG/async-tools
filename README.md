# Async tools

[![npm version](https://badge.fury.io/js/%40asanrom%2Fasync-tools.svg)](https://badge.fury.io/js/%40asanrom%2Fasync-tools)
[![Dependency Status](https://david-dm.org/AgustinSRG/async-tools.svg)](https://david-dm.org/AgustinSRG/async-tools)
[![devDependency Status](https://david-dm.org/AgustinSRG/async-tools/dev-status.svg)](https://david-dm.org/AgustinSRG/async-tools?type=dev)

Collection of tools to work with async funcions in javascript.

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

Interval that waits for the async function to end before runnng it again. Prevent multiple simultaneous executions.

Example use case: Async periodic task

Usage:

```ts
import { AsyncInterval } from "@asanrom/async-tools";ç

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

## Documentation

 - [Library documentation (Auto-generated)](https://agustinsrg.github.io/async-tools/)
