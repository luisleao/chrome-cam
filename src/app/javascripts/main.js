// Generated by CoffeeScript 1.3.3
(function() {

  require.config({
    paths: {
      Kendo: 'libs/kendo/kendo',
      Glfx: 'libs/glfx/glfx'
    }
  });

  require(['app', 'order!libs/jquery/plugins'], function(app) {
    return app.init();
  });

}).call(this);
