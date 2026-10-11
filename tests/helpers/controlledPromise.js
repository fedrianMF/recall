// A promise that the test resolves or rejects by hand, so the test decides
// exactly when a request "answers" (and can look at the pending state before).
export function createControlledPromise() {
  let resolve
  let reject

  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}
