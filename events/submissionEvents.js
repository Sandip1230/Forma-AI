const { EventEmitter } = require("events");

// A single in-process pub/sub hub for "a form was submitted" — the SSE
// stream (controllers/eventsController.js) subscribes each connected
// dashboard to it, and submitResponse publishes to it. Deliberately not
// backed by MongoDB change streams: those require a replica set, which a
// plain local `mongod` (a setup the README explicitly supports) doesn't
// provide, while this works identically either way. The tradeoff is it only
// sees submissions handled by this one Node process, which is fine at this
// app's scale (a single Express server, no clustering).
const submissionEvents = new EventEmitter();

// Each connected dashboard tab adds a listener for the life of its SSE
// connection — the default cap of 10 would print misleading "possible
// memory leak" warnings well before that's actually true here.
submissionEvents.setMaxListeners(0);

module.exports = submissionEvents;
