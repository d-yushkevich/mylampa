 (function () {
   'use strict';

   Lampa.Platform.tv();

   if (!Date.now) {
     Date.now = function () {
       return new Date().getTime();
     };
   }

   (function () {
     "use strict";
     for (var e = ["webkit", "moz"], f = 0; f < e.length && !window.requestAnimationFrame; ++f) {
       var g = e[f];
       window.requestAnimationFrame = window[g + "RequestAnimationFrame"];
       window.cancelAnimationFrame = window[g + "CancelAnimationFrame"] || window[g + "CancelRequestAnimationFrame"];
     }
     if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
       var h = 0;
       window.requestAnimationFrame = function (a) {
         var b = Date.now();
         var c = Math.max(h + 16, b);
         return setTimeout(function () {
           a(h = c);
         }, c - b);
       };
       window.cancelAnimationFrame = clearTimeout;
     }
   })();

   (function ($) {
     $.snowfall = function (element, options) {
       function Snowflake(x, y, size, speed) {
         this.x = x;
         this.y = y;
         this.size = size;
         this.speed = speed;
         this.step = 0;
         this.stepSize = random(1, 10) / 100;
         this.rotation = random(0, 360);
         this.rotationSpeed = random(-0.5, 0.5);

         var flakeColors = ['#FFFFFF', '#E0F7FA', '#E3F2FD', '#F0F8FF', '#F8FBFF'];
         var color = flakeColors[random(0, flakeColors.length - 1)];

         var el = document.createElement("div");
         $(el).attr({ class: "snowfall-flake" }).css({
           background: color,
           borderRadius: '50%',
           position: options.flakePosition,
           top: this.y,
           left: this.x,
           width: this.size,
           height: this.size,
           opacity: random(7, 10) / 10,
           boxShadow: "none", // убрали свечение
           zIndex: options.flakeIndex,
           transformOrigin: 'center center',
           transition: 'transform 0.1s linear'
         });

         if ($(element).get(0).tagName === $(document).get(0).tagName) {
           $("body").append($(el));
           element = $("body");
         } else {
           $(element).append($(el));
         }

         this.element = el;

         this.update = function () {
           this.y += this.speed;
           this.x += Math.cos(this.step) * 0.5;
           this.step += this.stepSize;
           this.rotation += this.rotationSpeed;

           this.element.style.top = this.y + "px";
           this.element.style.left = this.x + "px";
           this.element.style.transform = 'rotate(' + this.rotation + 'deg)';

           // если снежинка ушла за границы, ресетим
           if (this.y > height || this.x + this.size > width - margin || this.x < margin) {
             this.reset();
           }
         };

         this.reset = function () {
           // случайная стартовая позиция по вертикали и горизонтали
           this.y = random(0, height);
           this.x = random(margin, width - margin);
           this.size = random(options.minSize * 100, options.maxSize * 100) / 100;
           this.speed = random(options.minSpeed, options.maxSpeed);
           this.stepSize = random(1, 10) / 100;
           this.rotation = random(0, 360);
           this.rotationSpeed = random(-0.5, 0.5);
           this.element.style.width = this.size + "px";
           this.element.style.height = this.size + "px";
           this.element.style.background = flakeColors[random(0, flakeColors.length - 1)];
         };
       }

       function random(a, b) {
         return Math.round(a + Math.random() * (b - a));
       }

       function animate() {
         for (var j = 0; j < flakes.length; j++) {
           flakes[j].update();
         }
         animationFrame = requestAnimationFrame(animate);
       }

       var defaultOptions = {
         flakeCount: 40,
         flakePosition: "absolute",
         flakeIndex: 999999,
         minSize: 4,
         maxSize: 10,
         minSpeed: 0.3,
         maxSpeed: 1.2
       };

       options = $.extend(defaultOptions, options);

       var flakes = [];
       var margin = 0;
       var width = $(element).width();
       var height = $(element).height();
       var animationFrame;

       $(element).data("snowfall", this);

       $(window).on("resize", function () {
         width = $(element).width();
         height = $(element).height();
       });

       for (var i = 0; i < options.flakeCount; i++) {
         flakes.push(new Snowflake(random(margin, width - margin), random(0, height), random(options.minSize * 100, options.maxSize * 100) / 100, random(options.minSpeed, options.maxSpeed)));
       }

       animate();

       this.clear = function () {
         $(element).children(".snowfall-flake").remove();
         cancelAnimationFrame(animationFrame);
       };
     };

     $.fn.snowfall = function (options) {
       if (typeof options === "object" || options === undefined) {
         return this.each(function () {
           new $.snowfall(this, options);
         });
       } else if (typeof options === "string") {
         return this.each(function () {
           var instance = $(this).data("snowfall");
           if (instance) {
             instance.clear();
           }
         });
       }
     };
   })(jQuery);

   (function () {
     'use strict';

     function initSnow() {
       Lampa.SettingsApi.addParam({
         component: "interface",
         param: {
           name: "WinterSnow",
           type: "trigger",
           default: true
         },
         field: {
           name: "Показывать снег"
         },
         onChange: function () {
           if (Lampa.Storage.field("WinterSnow") === true) {
             showSnow();
           } else {
             hideSnow();
           }
         },
         onRender: function () {
           setTimeout(function () {
             $("div[data-name=\"WinterSnow\"]").insertAfter("div[data-name=\"black_style\"]");
           }, 0);
         }
       });

       if (Lampa.Storage.field("WinterSnow") === true) {
         showSnow();
       } else {
         hideSnow();
       }

       function showSnow() {
         window.winter = true;
         $(".background").snowfall({
           minSize: 4,
           maxSize: 10,
           minSpeed: 0.3,
           maxSpeed: 1.2,
           flakeCount: 40
         });
       }

       function hideSnow() {
         window.winter = false;
         $(".background").snowfall("clear");
       }
     }

     if (window.appready) {
       initSnow();
     } else {
       Lampa.Listener.follow("app", function (b) {
         if (b.type === "ready") {
           initSnow();
         }
       });
     }
   })();
 })();
