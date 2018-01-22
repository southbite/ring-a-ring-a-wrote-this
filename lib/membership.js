const HashRing = require('hashring');
const EventEmitter = require("events").EventEmitter;

module.exports.Membership = class {

  constructor(bootstrapPeer){
    this.__eventEmitter = new EventEmitter();
    this.peers = {};
    this.peers[bootstrapPeer.address] = bootstrapPeer;
    this.hashRing = new HashRing([bootstrapPeer.address]);
  }

  addPeer(peer){
    this.peers[peer.address] = peer;
    this.hashRing.add(peer.address);

    this.emit('add-peer', peer);
  }

  removePeer(peer){
    delete this.peers[peer.address];
    this.hashRing.remove(peer.address);

    this.emit('remove-peer', peer);
  }

  getPeerFromHashRing(key){
    var peerAddress = this.hashRing.get(key);
    return this.peers[peerAddress];
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