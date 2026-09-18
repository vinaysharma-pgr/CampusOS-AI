// src/database/index.js
// Exports a `db` proxy that resolves to the correct store at first access.
// This way, even if `server.js` flips `USE_MONGO` after mongoose fails,
// all callers automatically get the in-memory store.

import { memoryStore } from "./memoryStore.js";
import { mongoStore } from "./mongoStore.js";

// Pick the store at first method call, not at import time
const store = new Proxy({}, {
  get(_target, prop) {
    const useMongo = process.env.USE_MONGO === "true";
    const source = useMongo ? mongoStore : memoryStore;
    const value = source[prop];
    if (typeof value === "function") {
      return value.bind(source);
    }
    return value;
  },
});

export const db = store;
