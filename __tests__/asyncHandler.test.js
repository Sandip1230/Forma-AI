// Express 4 doesn't forward a rejected promise from an async route handler
// to error middleware on its own — it goes uncaught and crashes the whole
// process (a real bug hit early in this project). This guards asyncHandler
// against regressing back to that behavior.
const { asyncHandler } = require("../middleware/errorHandler");

describe("asyncHandler", () => {
  test("forwards a rejected promise to next(err) instead of throwing", async () => {
    const err = new Error("boom");
    const failingHandler = asyncHandler(async () => {
      throw err;
    });
    const next = jest.fn();

    await failingHandler({}, {}, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  test("does not call next() when the handler resolves normally", async () => {
    const okHandler = asyncHandler(async (req, res) => {
      res.done = true;
    });
    const next = jest.fn();
    const res = {};

    await okHandler({}, res, next);

    expect(res.done).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  test("passes req, res, and next through to the wrapped handler", async () => {
    const req = { id: 1 };
    const res = { id: 2 };
    const next = jest.fn();
    const handler = jest.fn().mockResolvedValue(undefined);

    await asyncHandler(handler)(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
  });
});
