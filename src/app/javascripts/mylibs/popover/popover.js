(function() {

  define(['Kendo', 'text!mylibs/popover/views/popover.html'], function(kendo, template) {
    var pub, viewModel;
    viewModel = {
      ok: function() {
        $.publish("/gallery/delete");
        return $("#popover").data("kendoMobilePopOver").close();
      },
      cancel: function() {
        return $("#popover").data("kendoMobilePopOver").close();
      }
    };
    return pub = {
      init: function(selector) {
        var view;
        view = new kendo.View(selector, template);
        return view.render(viewModel, true);
      }
    };
  });

}).call(this);
