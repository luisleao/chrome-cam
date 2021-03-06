// Generated by CoffeeScript 1.3.3
(function() {

  define(['Kendo', 'mylibs/effects/effects', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/full/views/full.html', 'text!mylibs/full/views/transfer.html'], function(kendo, effects, utils, filewrapper, template, transferImg) {
    var canvas, canvases, capture, ctx, draw, effect, elements, flash, frame, full, index, paparazzi, paused, pub, subscribe, transfer, video, videoCtx;
    canvas = {};
    ctx = {};
    video = {};
    videoCtx = {};
    paused = true;
    frame = 0;
    full = {};
    transfer = {};
    effect = {};
    paparazzi = {};
    draw = function() {
      return $.subscribe("/camera/stream", function(stream) {
        var request;
        if (paused) {
          return;
        }
        frame++;
        effects.advance(stream.canvas);
        effect(canvas, stream.canvas, frame, stream.track);
        request = function() {
          return $.publish("/postman/deliver", [null, "/camera/request"]);
        };
        return setTimeout(request, 1);
      });
    };
    flash = function(callback, file) {
      full.el.flash.show();
      transfer.content.kendoStop().kendoAnimate({
        effects: "transfer",
        target: $("#destination"),
        duration: 1000,
        ease: "ease-in",
        complete: function() {
          $.publish("/bottom/thumbnail", [file]);
          transfer.destroy();
          transfer = {};
          return callback();
        }
      });
      return full.el.flash.hide();
    };
    capture = function(callback) {
      var data, image, name;
      image = canvas.toDataURL("image/jpeg", 1.0);
      name = new Date().getTime();
      data = {
        src: image,
        height: full.content.height(),
        width: full.content.width()
      };
      transfer = new kendo.View(full.container, transferImg, data);
      transfer.render();
      transfer.content.offset({
        left: full.el.wrapper.offset().left
      });
      return transfer.find("img").load(function() {
        var file;
        file = {
          type: "jpg",
          name: "" + name + ".jpg",
          file: image
        };
        filewrapper.save(file.name, image);
        $.publish("/gallery/add", [file]);
        return flash(callback, file);
      });
    };
    index = {
      current: function() {
        var i, _i, _ref;
        for (i = _i = 0, _ref = effects.data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (effects.data[i].filter === effect) {
            return i;
          }
        }
      },
      max: function() {
        return effects.data.length;
      },
      select: function(i) {
        return pub.select(effects.data[i]);
      },
      preview: function(i) {
        return pub.select(effects.data[i], true);
      },
      unpreview: function() {
        return pub.select(effects.data[index.saved]);
      },
      saved: 0
    };
    subscribe = function(pub) {
      $.subscribe("/full/show", function(item) {
        return pub.show(item);
      });
      $.subscribe("/capture/photo", function() {
        return pub.photo();
      });
      $.subscribe("/capture/paparazzi", function() {
        return pub.paparazzi();
      });
      $.subscribe("/countdown/paparazzi", function() {
        return full.el.paparazzi.removeClass("hidden");
      });
      $.subscribe("/capture/video", function() {
        return pub.video();
      });
      $.subscribe("/full/filters/show", function(show) {
        var duration;
        duration = 200;
        if (show) {
          return full.el.filters.kendoStop().kendoAnimate({
            effects: "slideIn:right fade:in",
            show: true,
            hide: false,
            duration: duration
          });
        } else {
          return full.el.filters.kendoStop().kendoAnimate({
            effects: "slide:left fade:out",
            hide: true,
            show: false,
            duration: duration
          });
        }
      });
      $.subscribe("/full/capture/begin", function() {
        return full.el.wrapper.addClass("capturing");
      });
      $.subscribe("/full/capture/end", function() {
        return full.el.wrapper.removeClass("capturing");
      });
      return $.subscribe("/keyboard/arrow", function(dir) {
        if (paused) {
          return;
        }
        if (dir === "up" && index.current() > 0) {
          index.select(index.current() - 1);
        }
        if (dir === "down" && index.current() + 1 < index.max()) {
          return index.select(index.current() + 1);
        }
      });
    };
    elements = {
      cache: function(full) {
        full.find(".flash", "flash");
        full.find(".timer", "timer");
        full.find(".transfer", "transfer");
        full.find(".transfer img", "source");
        full.find(".wrapper", "wrapper");
        full.find(".paparazzi", "paparazzi");
        return full.find(".filters-list", "filters");
      }
    };
    canvases = {
      setup: function() {
        canvas = document.createElement("canvas");
        video = document.createElement("canvas");
        video.width = 720;
        video.height = 540;
        canvas.width = 360;
        canvas.height = 270;
        $(canvas).attr("style", "width: " + video.width + "px; height: " + video.height + "px;");
        ctx = canvas.getContext("2d");
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        videoCtx = video.getContext("2d");
        return videoCtx.scale(0.5, 0.5);
      }
    };
    return pub = {
      init: function(selector) {
        $.publish("/postman/deliver", [null, "/camera/request"]);
        full = new kendo.View(selector, template);
        canvases.setup();
        full.render().prepend(canvas);
        elements.cache(full);
        subscribe(pub);
        return draw();
      },
      show: function(item) {
        if (!paused) {
          return;
        }
        pub.select(item);
        paused = false;
        return full.container.kendoStop(true).kendoAnimate({
          effects: "zoomIn fadeIn",
          show: true,
          complete: function() {
            return $.publish("/bottom/update", ["full"]);
          }
        });
      },
      select: function(item, temp) {
        effect = item.filter;
        if (!temp) {
          full.el.filters.find("li").removeClass("selected").filter("[data-filter-id=" + item.id + "]").addClass("selected");
        }
        return $.publish("/postman/deliver", [item.tracks, "/tracking/enable"]);
      },
      filter: {
        click: function(e) {
          var i;
          i = $(e.target).data("filter-index");
          index.saved = i;
          return index.select(i);
        },
        mouseover: function(e) {
          return index.preview($(e.target).data("filter-index"));
        },
        mouseout: function(e) {
          return index.unpreview();
        }
      },
      photo: function() {
        var callback;
        callback = function() {
          return $.publish("/bottom/update", ["full"]);
        };
        return capture(callback, {
          index: 1,
          count: 1
        });
      },
      paparazzi: function() {
        var advance, callback, left;
        left = 4;
        advance = function() {
          full.el.wrapper.removeClass("paparazzi-" + left);
          left -= 1;
          return full.el.wrapper.addClass("paparazzi-" + left);
        };
        callback = function() {
          callback = function() {
            callback = function() {
              $.publish("/bottom/update", ["full"]);
              full.el.wrapper.removeClass("paparazzi-1");
              return full.el.paparazzi.addClass("hidden");
            };
            advance();
            return capture(callback, {
              index: 3,
              count: 3
            });
          };
          advance();
          return capture(callback, {
            index: 2,
            count: 3
          });
        };
        advance();
        return capture(callback, {
          index: 1,
          count: 3
        });
      }
    };
  });

}).call(this);
