(function() {

  define(['Kendo', 'mylibs/effects/effects', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/full/views/full.html'], function(kendo, effects, utils, filewrapper, fullTemplate) {
    var $container, $flash, canvas, ctx, draw, el, filter, flash, frame, frames, paused, preview, pub, recording, startTime, webgl;
    canvas = {};
    ctx = {};
    filter = {};
    webgl = {};
    preview = {};
    paused = true;
    frame = 0;
    frames = [];
    recording = false;
    $flash = {};
    startTime = 0;
    $container = {};
    el = {};
    draw = function() {
      return $.subscribe("/camera/stream", function(stream) {
        var time;
        if (!paused) {
          frame++;
          filter(canvas, stream.canvas, frame, stream.track);
          if (recording) {
            time = Date.now();
            frames.push({
              imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
              time: Date.now()
            });
            return $.publish("/full/timer/update");
          }
        }
      });
    };
    flash = function() {
      el.flash.show();
      return el.flash.kendoStop(true).kendoAnimate({
        effects: "fadeOut",
        duration: 1500,
        hide: true
      });
    };
    return pub = {
      show: function(e) {
        var match;
        $.publish("/bar/update", ["full"]);
        match = $.grep(effects.data, function(filters) {
          return filters.id === e.view.params.effect;
        });
        filter = match[0].filter;
        paused = false;
        el.content.height(el.container.height()) - 50;
        el.content.width((3 / 2) * el.content.height());
        return $(canvas).height(el.content.height());
      },
      init: function(selector) {
        $.subscribe("/capture/photo", function() {
          var image, name;
          flash();
          image = canvas.toDataURL();
          name = new Date().getTime() + ".jpg";
          return filewrapper.save(name, image).done(function() {
            $.publish("/bar/preview/update", [
              {
                thumbnailURL: image
              }
            ]);
            return $.publish("/bar/update", ["full"]);
          });
        });
        $.subscribe("/capture/video", function() {
          console.log("Recording...");
          frames = [];
          recording = true;
          startTime = Date.now();
          el.container.find(".timer").removeClass("hidden");
          return setTimeout((function() {
            utils.createVideo(frames);
            console.log("Recording Done!");
            recording = false;
            el.container.find(".timer").addClass("hidden");
            return $.publish("/bar/update", ["full"]);
          }), 6000);
        });
        kendo.fx.grow = {
          setup: function(element, options) {
            return $.extend({
              top: options.top,
              left: options.left,
              width: options.width,
              height: options.height
            }, options.properties);
          }
        };
        el.container = $(selector);
        canvas = document.createElement("canvas");
        canvas.width = 720;
        canvas.height = 480;
        ctx = canvas.getContext("2d");
        el.content = $(fullTemplate).appendTo(el.container);
        el.flash = el.content.find(".flash");
        el.content.prepend(canvas);
        $.subscribe("/full/flash", function() {
          return flash();
        });
        $.subscribe("/full/timer/update", function() {
          return el.container.find(".timer").first().html(kendo.toString((Date.now() - startTime) / 1000, "00.00"));
        });
        return draw();
      }
    };
  });

}).call(this);
