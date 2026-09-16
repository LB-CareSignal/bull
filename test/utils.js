/*eslint-env node */
'use strict';

var Queue = require('../');
var Promise = require('bluebird');
var STD_QUEUE_NAME = 'test queue';

var queues = [];

function simulateDisconnect(queue){
  queue.client.stream.end();
  queue.bclient.stream.end();
  queue.eclient.stream.end();
}

function buildQueue(name) {
  var queue = new Queue(name || STD_QUEUE_NAME, 6379, '127.0.0.1');
  queues.push(queue);
  return queue;
}

function newQueue(name){
  var queue = buildQueue(name);
  return new Promise(function(resolve){
    queue.on('ready', function(){
      resolve(queue);
    });
  });
}

function cleanupQueue(queue) {
  return queue.empty().then(queue.close.bind(queue));
}

function cleanupQueues() {
  return Promise.map(queues, function(queue){
    var errHandler = function() {};
    queue.on('error', errHandler);
    return queue.close().catch(errHandler);
  }).then(function(){
    queues = [];
  });
}

//
// Resolves once predicate() returns something truthy, polling until it does.
//
// Several tests need the queue to have reached a particular internal state
// before they act on it. Waiting for that state directly is reliable, whereas
// assuming it has been reached by the time the previous promise settles is a
// race that only shows up on a loaded machine.
//
function waitUntil(predicate, message, timeoutMs){
  var deadline = Date.now() + (timeoutMs || 2000);

  return new Promise(function(resolve, reject){
    (function poll(){
      var result;
      try{
        result = predicate();
      }catch(err){
        return reject(err);
      }

      if(result){
        return resolve(result);
      }
      if(Date.now() >= deadline){
        return reject(new Error('Timed out waiting until ' + (message || 'condition')));
      }
      setTimeout(poll, 5);
    })();
  });
}

module.exports = {
  simulateDisconnect: simulateDisconnect,
  buildQueue: buildQueue,
  cleanupQueue: cleanupQueue,
  newQueue: newQueue,
  cleanupQueues: cleanupQueues,
  waitUntil: waitUntil
};
