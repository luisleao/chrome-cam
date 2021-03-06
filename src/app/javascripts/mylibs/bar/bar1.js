(function() {

  define(['Kendo', 'mylibs/bar/state', 'mylibs/bar/bottom', 'text!mylibs/bar/views/bar.html', 'text!mylibs/bar/views/top.html'], function(kendo, state, Bar, template, topTemplate) {
    var countdown, el, mode, pub, startTime, viewModel;
    el = {};
    startTime = 0;
    mode = "photo";
    viewModel = kendo.observable({
      mode: {
        click: function(e) {
          var a;
          a = $(e.target);
          mode = a.data("mode");
          el.mode.find("a").removeClass("active");
          return a.addClass("active");
        }
      },
      capture: {
        click: function(e) {
          var capture, token;
          if (mode === "photo") {
            state.set("capture");
            capture = function() {
              return $.publish("/capture/" + mode);
            };
            if (e.ctrlKey) {
              return capture();
            } else {
              return countdown(0, capture);
            }
          } else {
            state.set("recording");
            startTime = Date.now();
            token = $.subscribe("/capture/" + mode + "/completed", function() {
              $.unsubscribe(token);
              el.content.removeClass("recording");
              return el.dot.css("border-radius", "100");
            });
            $.publish("/capture/" + mode);
            el.dot.css("border-radius", "0");
            return el.content.addClass("recording");
          }
        }
      },
      thumbnail: {
        src: "broken.jpg",
        display: "none"
      }
    });
    countdown = function(position, callback) {
      return $(el.counters[position]).kendoStop(true).kendoAnimate({
        effects: "zoomIn fadeIn",
        duration: 200,
        show: true,
        complete: function() {
          ++position;
          if (position < 3) {
            return setTimeout(function() {
              return countdown(position, callback);
            }, 500);
          } else {
            callback();
            return el.counters.hide();
          }
        }
      });
    };
    return pub = {
      init: function(topSelector, bottomSelector) {
        var bottom;
        bottom = new Bar(topSelector, topTemplate);
        el.container = $(bottomSelector);
        el.content = $(template);
        el.capture = el.content.find(".capture");
        el.dot = el.capture.find("> div > div");
        el.mode = el.content.find(".mode");
        el.filters = el.content.find(".filters");
        el.share = el.content.find(".share");
        el["delete"] = el.content.find(".delete");
        el.back = el.content.find(".back");
        el.thumbnail = el.content.find(".galleryLink");
        el.counters = el.content.find(".countdown > span");
        el.container.append(el.content);
        state = state.init(el);
        kendo.bind(el.container, viewModel);
        $.subscribe("/bar/preview/update", function(message) {
          viewModel.set("thumbnail.src", message.thumbnailURL);
          return el.thumbnail.show();
        });
        return $.subscribe("/bar/update", function(sender) {
          return state.set(sender);
        });
      }
    };
  });

}).call(this);
