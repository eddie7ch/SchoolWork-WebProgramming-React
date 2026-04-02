import "@testing-library/jest-dom";

// jsdom does not fully implement the Performance API.
// @testing-library/react v15 calls window.performance.mark/clearMarks internally.
// We must patch window.performance directly because the global `performance`
// resolves to Node's implementation (which has these methods), but
// @testing-library/react uses window.performance (jsdom's), which does not.
if (typeof window.performance.mark !== "function") {
  window.performance.mark = () => {};
}
if (typeof window.performance.clearMarks !== "function") {
  window.performance.clearMarks = () => {};
}
if (typeof window.performance.measure !== "function") {
  window.performance.measure = () => {};
}
if (typeof window.performance.clearMeasures !== "function") {
  window.performance.clearMeasures = () => {};
}

// jsdom does not always fully implement the Web Storage API.
// Provide an in-memory mock so localStorage-dependent code works in tests.
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});
