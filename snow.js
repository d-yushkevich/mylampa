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

   (function (a) {
     a.snowfall = function (b, c) {
       function Flake(x, y, size, speed) {
         this.x = x;
         this.y = y;
         this.size = size;
         this.speed = speed;
         this.step = 0;
         this.stepSize = rand(1, 10) / 100;
         this.rotation = rand(0, 360);

         var snowColors = ['#FFFFFF', '#E0F7FA', '#E3F2FD', '#F0F8FF', '#F8FBFF'];
         var randomColor = snowColors[rand(0, snowColors.length - 1)];
         var flake = document.createElement("div");

         a(flake).attr({ class: "snowfall-flake" }).css({
           background: randomColor,
           borderRadius: '50%',
           position: c.flakePosition,
           top: this.y,
           left: this.x,
           width: this.size,
           height: this.size,
           opacity: rand(7, 10) / 10,
           boxShadow: "0 0 10px rgba(255,255,255,0.8)",
           zIndex: c.flakeIndex,
         });

         if (a(b).get(0).tagName === a(document).get(0).tagName) {
           a("body").append(a(flake));
           b = a("body");
         } else {
           a(b).append(a(flake));
         }

         this.element = flake;

         this.update = function () {
           this.y += this.speed;
           this.x += Math.cos(this.step) * 0.5;
           this.step += this.stepSize;

           this.element.style.top = this.y + "px";
           this.element.style.left = this.x + "px";

           // Снег достиг "земли" (нижней границы)
           if (this.y > groundLevel - this.size) {
             drawSnowOnGround(this.x, this.size);
             this.reset();
           }

           if (this.x + this.size > width - margin || this.x < margin) {
             this.reset();
           }
         };

         this.reset = function () {
           this.y = 0;
           this.x = rand(margin, width - margin);
           this.size = rand(c.minSize * 100, c.maxSize * 100) / 100;
           this.speed = rand(c.minSpeed, c.maxSpeed);
           this.element.style.width = this.size + "px";
           this.element.style.height = this.size + "px";
         };
       }

       // Рисуем сугробы
       function drawSnowOnGround(x, size) {
         const groundX = Math.floor(x);
         const ctx = snowCanvas.getContext("2d");

         ctx.fillStyle = "rgba(255,255,255,0.95)";
         ctx.beginPath();
         ctx.arc(groundX, groundLevel - size / 2, size / 2, 0, Math.PI * 2);
         ctx.fill();

         // Сугроб слишком большой — слегка "таяние"
         snowHeight++;
         if (snowHeight > 300) {
           fadeSnow();
           snowHeight = 0;
         }
       }

       function fadeSnow() {
         const ctx = snowCanvas.getContext("2d");
         ctx.fillStyle = "rgba(255,255,255,0.9)";
         ctx.globalAlpha = 0.8;
         ctx.fillRect(0, 0, width, 100);
         ctx.globalAlpha = 1.0;
       }

       function loop() {
         for (let j = 0; j < flakes.length; j++) {
           flakes[j].update();
         }
         animation = requestAnimationFrame(loop);
       }

       const defaults = {
         flakeCount: 50,
         flakePosition: "absolute",
         flakeIndex: 999999,
         minSize: 4,
         maxSize: 10,
         minSpeed: 0.3,
         maxSpeed: 1.2,
       };

       let flakes = [];
       let settings = a.extend(defaults, c);
       const rand = (a, b) => Math.round(a + Math.random() * (b - a));

       const height = a(b).height();
       const width = a(b).width();
       const margin = 0;
       const groundLevel = height - 50; // высота сугробов
       let snowHeight = 0;
       let animation;

       // Создаём canvas для сугробов
       const snowCanvas = document.createElement("canvas");
       snowCanvas.className = "snowfall-ground";
       snowCanvas.width = width;
       snowCanvas.height = 60;
       a(b).append(snowCanvas);
       a(snowCanvas).css({
         position: "absolute",
         bottom: "0",
         left: "0",
         zIndex: 999998,
       });

       // Создаём снежинки
       for (let j = 0; j < settings.flakeCount; j++) {
         flakes.push(new Flake(rand(margin, width - margin), rand(0, height), rand(settings.minSize * 100, settings.maxSize * 100) / 100, rand(settings.minSpeed, settings.maxSpeed)));
       }

       loop();

       this.clear = function () {
         a(b).children(".snowfall-flake").remove();
         a(b).children(".snowfall-ground").remove();
         cancelAnimationFrame(animation);
       };
     };

     a.fn.snowfall = function (b) {
       if (typeof b == "object" || b == undefined) {
         return this.each(function () {
           new a.snowfall(this, b);
         });
       } else if (typeof b == "string") {
         return this.each(function () {
           const c = a(this).data("snowfall");
           if (c) c.clear();
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
           name: "WinterSnow",
           type: "trigger",
           default: true
         },
         field: {
           name: "Показывать снег и сугробы"
         },
         onChange: function () {
           if (Lampa.Storage.field("WinterSnow") == true) {
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

       if (Lampa.Storage.field("WinterSnow") == true) {
         showSnow();
       } else {
         hideSnow();
       }

       function showSnow() {
         window.winter = true;
         var options = {
           minSize: 4,
           maxSize: 10,
           minSpeed: 0.3,
           maxSpeed: 1.2,
           flakeCount: 50
         };
         $(".background").snowfall(options);
       }

       function hideSnow() {
         window.winter = false;
         $(".background").snowfall("clear");
       }
     }

     if (window.appready) {
       setupSnow();
     } else {
       Lampa.Listener.follow("app", function (b) {
         if (b.type == "ready") {
           setupSnow();
         }
       });
     }
   })();
 })();
