// Test

"use strict";

import assert from 'assert';
import { AsyncProvider } from '../src';

function waitMs(ms: number): Promise<void> {
    return new Promise<void>(function (resolve) {
        setTimeout(resolve, ms);
    })
}

async function provideValueWithDelay<T>(provider: AsyncProvider<T>, value: T) {
    await waitMs(20);

    provider.provideValue(value);
}

async function provideErrorWithDelay<T>(provider: AsyncProvider<T>, error: Error) {
    await waitMs(20);

    provider.provideError(error);
}

async function getPromiseError(promise: Promise<any>): Promise<Error | null> {
    try {
        await promise;
    } catch (ex) {
        return ex;
    }

    return null;
}

describe("Async Provider", () => {
    it('Provides value successfully', async () => {
        // Timeout set and wait
        const provider1 = new AsyncProvider<number>(2000);
        provideValueWithDelay(provider1, 7);
        const v1 = await provider1.getValue();
        assert.equal(v1, 7);

        // No timeout set and wait
        const provider2 = new AsyncProvider<string>();
        provideValueWithDelay(provider2, "test");
        const v2 = await provider2.getValue();
        assert.equal(v2, "test");

        // No timeout set no wait
        const provider3 = new AsyncProvider<boolean>();
        provider3.provideValue(true);
        const v3 = await provider3.getValue();
        assert.equal(v3, true);
    });

    it('Provides error successfully', async () => {
        // Timeout set and wait
        const provider1 = new AsyncProvider<number>(2000);
        provideErrorWithDelay(provider1, new Error("test 1"));
        const e1 = await getPromiseError(provider1.getValue());
        assert.notEqual(e1, null);
        assert.equal(e1?.message, "test 1");

        // No timeout set and wait
        const provider2 = new AsyncProvider<string>();
        provideErrorWithDelay(provider2, new Error("test 2"));
        const e2 = await getPromiseError(provider2.getValue());
        assert.notEqual(e2, null);
        assert.equal(e2?.message, "test 2");

        // No timeout set no wait
        const provider3 = new AsyncProvider<boolean>();
        provider3.provideError(new Error("test 3"));
        const e3 = await getPromiseError(provider3.getValue());
        assert.notEqual(e3, null);
        assert.equal(e3?.message, "test 3");
    });

    it('Times out if the value nor error are provided in time', async () => {
        const provider = new AsyncProvider<number>(20);

        const e = await getPromiseError(provider.getValue());

        assert.notEqual(e, null);

        if (e !== null) {
            assert.equal(AsyncProvider.isTimeoutError(e), true);
        }
    });

    it('Can be reused if called reset', async () => {
        const provider = new AsyncProvider<number>(2000);

        provideValueWithDelay(provider, 7);
        const v1 = await provider.getValue();
        assert.equal(v1, 7);

        provider.reset();

        provideValueWithDelay(provider, 9);
        const v2 = await provider.getValue();
        assert.equal(v2, 9);
    });
});
