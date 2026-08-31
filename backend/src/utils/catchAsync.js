/**
 * Wraps an async route/controller so any rejected promise or thrown error
 * is forwarded to next(err) instead of crashing the process or requiring
 * a try/catch in every single controller.
 *
 * Usage: router.post("/", catchAsync(controller.create))
 */
module.exports = function catchAsync(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
