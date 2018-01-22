const EventEmitter = require("events").EventEmitter;

module.exports.Socket = class {

  constructor(peer){
    this.__eventEmitter = new EventEmitter();

  }

  emit(key, data){
    return this.__eventEmitter.emit(key, data);
  }

  on(key, handler){
    return this.__eventEmitter.on(key, handler);
  }

  off(key, handler) {
    return this.__eventEmitter.removeListener(key, handler);
  }
};