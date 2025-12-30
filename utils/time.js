function now(req) {
  if (process.env.TEST_MODE === "1") {
    const testTime = req.headers["x-test-now-ms"];
    if (testTime) {
      return Number(testTime);
    }
  }
  return Date.now();
}

module.exports = { now };
