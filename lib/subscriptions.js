module.exports.Subscriptions = class {

  constructor(){
    this.subscriptions = {};
  }

  add(clientAddress, path, peerAddress){

    if (!this.subscriptions[path]){
      this.subscriptions[path] = [];
    }

    this.subscriptions[path].push({clientAddress: clientAddress, peerAddress:peerAddress});
  }

  search(searchPath) {

    var self = this;

    var subscriptions = [];

    Object.keys(this.subscriptions).forEach(function (path) {

      if (path == searchPath) self.subscriptions[path].forEach(function(subscription){
        subscriptions.push(subscription);
      })
    });

    return subscriptions;
  }

};