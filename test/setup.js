/*eslint-env node */
'use strict';

//
// Node 15 started tearing down the process on an unhandled promise rejection,
// where Node 14 and older only printed a warning. This suite was written
// against the old behaviour and trips over the new one during teardown: queues
// get closed while adds and events are still in flight, and those in flight
// operations then reject with 'Connection is closed'.
//
// Registering a handler restores the pre Node 15 behaviour for the test run
// only. The rejections are still printed, so nothing is silently swallowed.
//
process.on('unhandledRejection', function (err) {
  console.error('Unhandled rejection during tests:', (err && err.stack) || err);
});
