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
     if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
       var lastTime = 0;
       window.requestAnimationFrame = function (callback) {
         var currTime = Date.now();
         var timeToCall = Math.max(0, 16 - (currTime - lastTime));
         var id = setTimeout(function () {
           callback(currTime + timeToCall);
         }, timeToCall);
         lastTime = currTime + timeToCall;
         return id;
       };
       window.cancelAnimationFrame = clearTimeout;
     }
   })();

   (function ($) {
     $.snowfall = function (container, options) {
       var settings = $.extend({}, {
         flakeCount: 80,
         flakeColor: "#ffffff",
         flakePosition: "absolute",
         flakeIndex: 999999,
         minSize: 3,
         maxSize: 8,
         minSpeed: 2,
         maxSpeed: 6,
         round: true,
         shadow: true,
         wind: true,
         swing: true,
         opacity: true,
         gradient: true,
         twinkle: true,
         meltEffect: true
       }, options);

       var flakes = [];
       var animationId = 0;
       var wind = 0.5;
       var $container = $(container);
       var isPaused = false;

       function random(min, max) {
         return Math.floor(Math.random() * (max - min + 1)) + min;
       }

       function Snowflake(x, y, size, speed) {
         this.x = x;
         this.y = y;
         this.size = size;
         this.speed = speed;
         this.step = 0;
         this.stepSize = random(1, 15) / 100;
         this.swingOffset = random(0, Math.PI * 2);
         this.swingSpeed = random(2, 5) / 100;
         this.opacity = random(6, 10) / 10;
         this.element = document.createElement("div");
         this.element.className = "snowfall-flake";

         var styles = {
           width: this.size + "px",
           height: this.size + "px",
           position: settings.flakePosition,
           top: this.y + "px",
           left: this.x + "px",
           borderRadius: "50%",
           opacity: this.opacity,
           zIndex: settings.flakeIndex,
           pointerEvents: "none",
           userSelect: "none"
         };

         if (settings.shadow) {
           styles.boxShadow = "1px 1px 3px rgba(0,0,0,0.3)";
         }

         styles.background = `radial-gradient(circle at 30% 30%, 
                     rgba(255,255,255,${this.opacity}), 
                     rgba(200,200,255,${this.opacity * 0.3}))`;

         $(this.element).css(styles);
         $container.append(this.element);

         this.update = () => {
           this.y += this.speed + Math.sin(this.step) * 0.3;
           this.step += this.stepSize;
           this.x += wind + Math.cos(this.step) * 0.8;

           var containerWidth = $container.width();
           var containerHeight = $container.height();
           if (this.y > containerHeight - (this.size + 10)) {
             this.reset();
           }
           if (this.x > containerWidth + 25) this.x = -25;
           else if (this.x < -25) this.x = containerWidth + 25;

           this.element.style.top = this.y + "px";
           this.element.style.left = this.x + "px";
         };

         this.reset = () => {
           this.y = -this.size;
           this.x = random(-50, $container.width() + 50);
           this.stepSize = random(1, 15) / 100;
           this.size = random(settings.minSize * 100, settings.maxSize * 100) / 100;
           this.speed = random(settings.minSpeed, settings.maxSpeed);
           this.opacity = random(6, 10) / 10;
           this.element.style.width = this.size + "px";
           this.element.style.height = this.size + "px";
           this.element.style.opacity = this.opacity;
         };
       }

       function updateWind() {
         wind = 0.3 + Math.sin(Date.now() * 0.001) * 0.4;
       }

       function animate() {
         if (isPaused) return;
         updateWind();
         for (var i = 0; i < flakes.length; i++) {
           flakes[i].update();
         }
         animationId = requestAnimationFrame(animate);
       }

       function init() {
         var containerWidth = $container.width();
         var containerHeight = $container.height();
         for (var i = 0; i < settings.flakeCount; i++) {
           flakes.push(new Snowflake(
             random(-100, containerWidth + 100),
             random(-200, containerHeight),
             random(settings.minSize * 100, settings.maxSize * 100) / 100,
             random(settings.minSpeed, settings.maxSpeed)
           ));
         }
         animate();
       }

       this.clear = function () {
         isPaused = true;
         if (animationId) {
           cancelAnimationFrame(animationId);
           animationId = 0;
         }
         for (var i = 0; i < flakes.length; i++) {
           $(flakes[i].element).remove();
         }
         flakes = [];
       };

       $container.data("snowfall", this);
       init();
     };

     $.fn.snowfall = function (options) {
       if (typeof options === "object" || options === undefined) {
         return this.each(function () {
           new $.snowfall(this, options);
         });
       } else if (typeof options === "string") {
         return this.each(function () {
           var instance = $(this).data("snowfall");
           if (instance && typeof instance[options] === "function") {
             instance[options]();
           }
         });
       }
     };
   })(jQuery);

   (function () {
     'use strict';

     function setupSnow() {
       Lampa.SettingsApi.addParam({
         component: "interface",
         param: {
           name: "Snow",
           type: "trigger",
           default: true
         },
         field: {
           name: "Показывать снегопад"
         },
         onChange: function () {
           if (Lampa.Storage.field("Snow") == true) {
             startSnow();
           } else {
             stopSnow();
           }
         },
         onRender: function () {
           setTimeout(function () {
             $("div[data-name=\"Snow\"]").insertAfter("div[data-name=\"black_style\"]");
           }, 0);
         }
       });

       if (Lampa.Storage.field("Snow") == true) {
         startSnow();
       } else {
         stopSnow();
       }

       function startSnow() {
         window.snowActive = true;
         var config = {
           flakeCount: 100,
           minSize: 3,
           maxSize: 8,
           minSpeed: 2,
           maxSpeed: 6,
           wind: true,
           swing: true,
           opacity: true,
           gradient: true,
           twinkle: true,
           meltEffect: true
         };
         $(".background").snowfall(config);
       }

       function stopSnow() {
         window.snowActive = false;
         $(".background").snowfall("clear");
       }
     }

     if (window.appready) {
       setupSnow();
     } else {
       Lampa.Listener.follow("app", function (e) {
         if (e.type == "ready") {
           setupSnow();
         }
       });
     }
   })();
 })();
