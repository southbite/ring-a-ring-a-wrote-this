const hyperid = require('hyperid')
const CONSTANTS = require('./constants');

module.exports.Client = class {

  constructor(){
    this.subscriptions = {};
  }

  joinCluster(edgeNode){
    edgeNode.addClient(this);
  }

  receiveData(data){

    if (this.subscriptions[data.path]){

      var self = this;

      Object.keys(this.subscriptions[data.path].handlers).forEach(function(handlerKey){
        var handler = self.subscriptions[data.path].handlers[handlerKey];
        handler.call(self, data.payload);
      });
    }
  }

  writeData(data){

    data.sourceAddress = this.address;
    this.endpoint.emit(this.endpointAddress + ':data', data);
  }

  publish(path, data){

    this.writeData({path: path, payload:data, messageType:CONSTANTS.MESSAGE_TYPE.WRITE});
  }

  subscribe(path, handler){

    //refCount on client side, so only one subscription is made to the server for duplicate paths

    const subscriptionId = hyperid();

    if (!this.subscriptions[path]){

      this.subscriptions[path] = {
        handlers:{},
        refCount:1
      };

      this.writeData({messageType:CONSTANTS.MESSAGE_TYPE.SUBSCRIBE, path:path});

    } else this.subscriptions[path].refCount++;

    this.subscriptions[path].handlers[subscriptionId] = handler.bind(this);

    return subscriptionId;
  }
};