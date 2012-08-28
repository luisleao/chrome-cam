(function() {

  define(['mylibs/utils/utils', 'text!mylibs/gallery/views/gallery.html'], function(utils, templateSource) {
    var createPage, loadImages, pub, setupSubscriptionEvents, template;
    template = kendo.template(templateSource);
    loadImages = function() {
      var deferred, token;
      deferred = $.Deferred();
      token = $.subscribe("/pictures/bulk", function(result) {
        var dataSource;
        if (result.message instanceof Array && result.message.length > 0) {
          $.publish("/bar/preview/update", [
            {
              thumbnailURL: result.message.slice(-1)[0].image
            }
          ]);
        }
        $.unsubscribe(token);
        dataSource = new kendo.data.DataSource({
          data: result.message,
          pageSize: 12,
          change: function() {
            return $.publish("/gallery/page", [dataSource]);
          }
        });
        dataSource.read();
        return deferred.resolve(dataSource);
      });
      $.publish("/postman/deliver", [{}, "/file/read", []]);
      return deferred.promise();
    };
    createPage = function(dataSource, $container) {
      var rowLength, rows;
      rowLength = 4;
      rows = [dataSource.view().slice(0 * rowLength, (1 * rowLength)), dataSource.view().slice(1 * rowLength, (2 * rowLength)), dataSource.view().slice(2 * rowLength, (3 * rowLength))];
      return $container.html(template({
        rows: rows
      }));
    };
    setupSubscriptionEvents = function($container) {
      $.subscribe("/gallery/show", function(fileName) {
        return console.log(fileName);
      });
      $.subscribe("/gallery/hide", function() {
        $container.kendoStop().kendoAnimate({
          effect: "slide:down",
          duration: 1000,
          hide: true
        });
        return $("#preview").kendoStop().kendoAnimate({
          effect: "slideIn:down",
          duration: 1000,
          show: true,
          complete: function() {
            return $.publish("/previews/pause", [false]);
          }
        });
      });
      $.subscribe("/gallery/list", function() {
        $.publish("/previews/pause", [true]);
        $container.kendoStop().kendoAnimate({
          effect: "slideIn:up",
          duration: 1000,
          show: true
        });
        return $("#preview").kendoStop().kendoAnimate({
          effect: "slide:up",
          duration: 1000,
          hide: true
        });
      });
      return $.subscribe("/gallery/page", function(dataSource) {
        return createPage(dataSource, $container);
      });
    };
    return pub = {
      init: function(selector) {
        var $container;
        $container = $(selector);
        return loadImages().done(function(dataSource) {
          $container.on("click", ".thumbnail", function() {
            return $.publish("/gallery/show", [$(this).data("file-name")]);
          });
          $container.kendoMobileSwipe(function(e) {
            if (e.direction === "right" && dataSource.page() > 1) {
              dataSource.page(dataSource.page() - 1);
            }
            if (e.direction === "left" && dataSource.page() < dataSource.totalPages()) {
              return dataSource.page(dataSource.page() + 1);
            }
          });
          setupSubscriptionEvents($container);
          $.subscribe("/gallery/add", function(file) {
            return dataSource.add(file);
          });
          return $.publish("/gallery/page", [dataSource]);
        });
      }
    };
  });

}).call(this);
