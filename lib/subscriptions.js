module.exports.Subscriptions = class {

  constructor(){
    this.subscriptions = {};
  }

  possiblePaths(path){

    var parts = path.split('/');
    var possible = [path];

    for (var i = 0; i < parts.length; i++){
      var possibilityParts = parts.slice(0, i);
      for (var ii = parts.length; ii > i; ii--) possibilityParts.push('*');
      possible.push(possibilityParts.join('/'));
    }

    return possible;
  }

  add(clientAddress, path, peerAddress, edgeAddress){

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