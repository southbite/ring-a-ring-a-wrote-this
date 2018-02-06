describe.only('connections', function () {

  var expect = require('expect.js');
  var async = require('async');

  var PEERS_COUNT = 10;

  var CLIENTS_COUNT = 10;

  var DATA_POINTS_COUNT = 1000;

  var SUBS_PER_CLIENT_COUNT = 10;

  const {Client} = require('../lib/client');

  const {ClusterPeer} = require('../lib/cluster-peer');
  const bootStrapPeer = new ClusterPeer('10.0.0.1', true);

  const peers = [];
  const clients = [];

  const random = require('./__fixtures/random');

  const dataPoints = random.randomPaths({count: DATA_POINTS_COUNT});

  var segmentPaths3Count = 0;

  dataPoints.forEach(function(point){
    if (point.split('/').length == 3) segmentPaths3Count++;
  });

  var RECEIVED = {};
  var WILD_RECEIVED = {};

  it('sets up the cluster', function (done) {

    for (var i = 0; i < PEERS_COUNT - 1; i++) {
      var newPeer = new ClusterPeer('10.0.0.' + (i + 2));

      newPeer.joinCluster(bootStrapPeer);
      peers.push(newPeer);
    }

    done();

  });

  it('sets up the clients', function (done) {

    for (var i = 0; i < CLIENTS_COUNT; i++) {
      var newClient = new Client();

      newClient.joinCluster(bootStrapPeer);
      clients.push(newClient);
    }

    done();

  });

  it('sets up subscriptions', function (done) {

    clients.forEach(function(client){

      for (var i = 0; i < DATA_POINTS_COUNT; i++) {

        client.subscribe(dataPoints[i], function(data){

          if (RECEIVED[this.address] == null) RECEIVED[this.address] = 0;
          RECEIVED[this.address]++;

        }.bind(client));
      }
    });

    done();
  });

  it('sets up wildcard subscriptions', function (done) {

    clients.forEach(function(client){

      client.subscribe('*/*/*', function(data){

        if (WILD_RECEIVED[this.address] == null) WILD_RECEIVED[this.address] = 0;
        WILD_RECEIVED[this.address]++;

      }.bind(client));
    });

    done();
  });

  it('posts data to data points, selecting a random client for each post', function (done) {

    this.timeout(15000);

    for (var i = 0; i < DATA_POINTS_COUNT; i++) {

      var randomIndex = random.integer(0, CLIENTS_COUNT - 1);

      var randomClient = clients[randomIndex];

      randomClient.publish(dataPoints[i], {i:i, id:randomClient.address, path:dataPoints[i]});
    }

    done();

  });

  it('verifies the subscriptions were distributed and all clients received their messages', function (done) {

    var allReceived = true;

    console.log('client.RECEIVED should be:::', DATA_POINTS_COUNT);
    console.log('-------------------------------------------------------');

    clients.forEach(function(client){
      console.log('client.RECEIVED:::', client.address, RECEIVED[client.address]);
      if (RECEIVED[client.address] != DATA_POINTS_COUNT) {
        console.log('allReceived = false');
        allReceived = false;
      }
    });

    console.log('client.WILD_RECEIVED should be:::', segmentPaths3Count);
    console.log('-------------------------------------------------------');

    clients.forEach(function(client){
      console.log('client.WILD_RECEIVED:::', client.address, WILD_RECEIVED[client.address], segmentPaths3Count);
      if (WILD_RECEIVED[client.address] != segmentPaths3Count) {
        console.log('allReceived = false');
        allReceived = false;
      }
    });

    if (!allReceived) return done(new Error('expected received message counts to be accurate'));

    var subsDistributed = true;

    var totalSubscriptions = DATA_POINTS_COUNT + clients.length;

    console.log('-------------------------------------------------------');
    console.log('CLUSTER PEER SUBS COUNT SHOULD BE > 0 and < ' + totalSubscriptions / peers.length * 2);
    console.log('-------------------------------------------------------');
    peers.forEach(function(peer){

      if (Object.keys(peer.subscriptions.subscriptions).length == 0) subsDistributed = false;
      if (Object.keys(peer.subscriptions.subscriptions).length > (totalSubscriptions / peers.length * 2)) subsDistributed = false;

      console.log('CLUSTER PEER SUBS COUNT:::', peer.address, Object.keys(peer.subscriptions.subscriptions).length);
    });

    console.log('-------------------------------------------------------');

    if (!subsDistributed) return done('subscriptions were not distributed fairly');

    done();

  });
});
