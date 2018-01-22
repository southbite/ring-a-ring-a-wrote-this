Introduction
-------------------------
Distributed pub/sub using [hash-rings](https://akshatm.svbtle.com/consistent-hash-rings-theory-and-implementation). Thanks to [3rd Eden](https://github.com/3rd-Eden/node-hashring) for the implementation.

Test code, demonstrates the use of hash-rings in a pub-sub system to distribute subscriptions. This project is purely an exercise in testing a hash-ring on a pseudo distributed system (peers in cluster are objects not processes - as are clients)

To run the example tests, which explain how the setup works:

```
> git clone https://github.com/southbite/ring-a-ring-a-wrote-this.git && cd ring-a-ring-a-wrote-this
> npm install
> npm test
```

TODO:

1. multiple peers returned by hash-ring, for backup/rebalancing
2. when socket connection is created, hashing peer addresses to produce the lowest hash sets who creates the socket
3. the introduction of the * to represent a suffix id on the subscription and input path, this means that emits and subscriptions will use a pair of paths /test/1 and /test/*
4. rebalancing code and tests - removal of a peer from the cluster
