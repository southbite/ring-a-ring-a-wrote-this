const {Membership} = require('./membership');
const {Socket} = require('./socket');
const {Subscriptions} = require('./subscriptions');
const {Database} = require('./db');
const hyperid = require('hyperid');
const newId = new hyperid();
const CONSTANTS = require('./constants');

module.exports.ClusterPeer = class {

  constructor(address, isBootstrapper, hashSecret) {
    this.peerConnections = {};
    this.clientConnections = {};
    this.address = address;
    this.db = new Database();
    this.subscriptions = new Subscriptions();
    if (isBootstrapper) this.joinCluster(this);
  }

  joinCluster(bootstrapPeer) {

    var self = this;

    if (bootstrapPeer == this) this.membership = new Membership(this);

    else {
      this.membership = bootstrapPeer.membership;
      this.bootstrapPeer = bootstrapPeer;
    }

    this.membership.on('add-peer', function(peer){

      if (peer.address != self.address){
        self.negotiatePeerSocketConnection(peer);
      }
    });

    this.membership.on('remove-peer', function(peer){

      if (peer.address != self.address){
        self.dropPeerSocketConnection(peer);
      }
    });

    this.membership.addPeer(this);
  }

  dropPeerSocketConnection(peer){

    this.peerConnections[peer.address].disconnect();
    delete this.peerConnections[peer.address];

    peer.peerConnections[this.address].disconnect();
    delete peer.peerConnections[this.address];
  }

  negotiatePeerSocketConnection(peer){

    this.peerConnections[peer.address] = new Socket();
    peer.peerConnections[this.address] = this.peerConnections[peer.address];

    this.peerConnections[peer.address].on(this.address + ':data', this.receivePeerData.bind(this));
    peer.peerConnections[this.address].on(peer.address + ':data', peer.receivePeerData.bind(peer));
  }

  receivePeerData(data){

  }

  writePeerData(address, data){

    this.peerConnections[address].emit(address + ':data', data);
  }

  addClient(client) {

    client.address = newId();

    client.endpointAddress = this.address;

    this.negotiateClientSocketConnection(client);
  }

  dropClient(client) {

    this.dropClientSocketConnection(client);
  }

  dropClientSocketConnection(client){

    this.clientConnections[client.address].disconnect();
    delete this.clientConnections[client.address];
  }

  negotiateClientSocketConnection(client){

    this.clientConnections[client.address] = new Socket();
    client.endpoint = this.clientConnections[client.address];

    this.clientConnections[client.address].on(this.address + ':data', this.receiveClientData.bind(this));
    client.endpoint.on(client.address + ':data', client.receiveData.bind(client));
  }

  emitToEdges(path, data){

    this.subscriptions.search(path).forEach((subscription)=>{

      var edgePeer = this.membership.peers[subscription.edgeAddress];
      //TODO intra-cluster socket request
      edgePeer.emitClientData(subscription.clientAddress, path, data);
    });
  }

  emitClientData(clientAddress, path, data){
    this.clientConnections[clientAddress].emit(clientAddress + ':data', {path:path, payload:data.payload});
  }

  receiveClientData(data){

    var self = this;

    // if (data.messageType == CONSTANTS.MESSAGE_TYPE.CONTROL){
    //
    // }

    if (data.messageType == CONSTANTS.MESSAGE_TYPE.SUBSCRIBE){

      var peer = this.membership.getPeerFromHashRing(data.path);

      peer.subscriptions.add(data.sourceAddress, data.path, peer.address, this.address);
    }

    if (data.messageType == CONSTANTS.MESSAGE_TYPE.WRITE){

      var possiblePaths = this.subscriptions.possiblePaths(data.path);

      possiblePaths.forEach(function(path){
        var peer = self.membership.getPeerFromHashRing(path);
        peer.emitToEdges(path, data);
      });
    }
  }
};