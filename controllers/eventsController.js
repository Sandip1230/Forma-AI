const submissionEvents = require("../events/submissionEvents");

const HEARTBEAT_MS = 25000;

// A long-lived SSE stream, not a normal request/response cycle, so this
// isn't wrapped in asyncHandler like the other controllers — there's no
// promise to await or error to forward, just a connection that stays open
// until the client disconnects.
function streamEvents(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write("\n");

  const onSubmission = (payload) => {
    res.write(`event: submission\ndata: ${JSON.stringify(payload)}\n\n`);
  };
  submissionEvents.on("submission", onSubmission);

  // A comment line (ignored by EventSource) every so often keeps the
  // connection from being silently dropped by an idle timeout in between.
  const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), HEARTBEAT_MS);

  req.on("close", () => {
    clearInterval(heartbeat);
    submissionEvents.off("submission", onSubmission);
  });
}

module.exports = { streamEvents };
