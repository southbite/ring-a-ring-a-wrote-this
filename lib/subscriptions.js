module.exports.Subscriptions = class {

  constructor(){
    this.subscriptions = {};
  }

  possiblePaths(path){

    var parts = path.split('/');
    var possible = [path];

    for (var i = 1; i < parts.length; i++){
      var possibility = parts.slice(0, i).join('/');
      for (var ii = parts.length; ii > i; ii--) possibility += '/*';
      possible.push(possibility);
    }

    return possible;
  }

  add(clientAddress, path, peerAddress, edgeAddress){

    console.log('subscribeClientData:::', path, clientAddress);

    if (!this.subscriptions[path]){
      this.subscriptions[path] = [];
    }

    this.subscriptions[path].push({clientAddress: clientAddress, peerAddress:peerAddress, edgeAddress: edgeAddress});
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