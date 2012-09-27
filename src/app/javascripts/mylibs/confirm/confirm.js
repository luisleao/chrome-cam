(function() {

  define(['Kendo', 'text!mylibs/confirm/views/confirm.html'], function(kendo, template) {
    var pub, view,
      _this = this;
    view = {};
    this.callback = null;
    return pub = {
      yes: function(e) {
        view.data("kendoMobileModalView").close();
        if (_this.callback) return _this.callback();
      },
      no: function(e) {
        return view.data("kendoMobileModalView").close();
      },
      init: function(selector) {
        view = $(selector);
        return $.subscribe("/confirm/show", function(title, message, callback) {
          _this.callback = callback;
          view.find(".title").html(title);
          view.find(".message").html(message);
          return view.data("kendoMobileModalView").open();
        });
      }
    };
  });

}).call(this);
