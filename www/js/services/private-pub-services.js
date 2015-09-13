valaApp.service('PrivatePubServices', function() {
  var x = {};
  x.subscribe = function (channel) {
    PrivatePub.sign({
      channel: channel,
      timestamp: 1302306682972,
      signature: "dc1c71d3e959ebb6f49aa6af0c86304a0740088d",
      server: "https://vala-app-faye.herokuapp.com/faye"
    });
  }
  x.logMessages = function(channel) {
    PrivatePub.subscribe(channel, function(data, channel) {
      console.log(channel);
      console.log(data);
    });
  };
  return x;
});