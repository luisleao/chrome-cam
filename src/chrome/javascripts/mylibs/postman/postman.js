(function() {

  define([], function() {
    /*		The Postman!
    
    	The postman is a super simple combination of pub/sub and post message. 
    
    	outgoing: the postman simply listens for the /postman/deliver message and dispatches whatever 
    	its contents are as the body of the 'message' object. The address is used by the receiver 
    	to determine who should respond to the message.
    
    	incoming: the postman listens to the post message event on the window and 
    	dispatches the event with the address specified
    */
    var pub;
    return pub = {
      init: function(r) {
        var recipient;
        recipient = r;
        window.onmessage = function(event) {
          return $.publish(event.data.address, [event.data.message]);
        };
        return $.subscribe("/postman/deliver", function(message, address, block) {
          var delivery;
          delivery = {};
          delivery.address = address;
          delivery.message = message;
          return recipient.postMessage(delivery, "*", block);
        });
      }
    };
  });

}).call(this);
