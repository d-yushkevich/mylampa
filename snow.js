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
         var lastTime = 0;
         var vendors = ['webkit', 'moz'];
         
         for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
             window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
             window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
             window[vendors[x] + 'CancelRequestAnimationFrame'];
         }
         
         if (!window.requestAnimationFrame) {
             window.requestAnimationFrame = function(callback) {
                 var currTime = Date.now();
                 var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                 var id = window.setTimeout(function() {
                     callback(currTime + timeToCall);
                 }, timeToCall);
                 lastTime = currTime + timeToCall;
                 return id;
             };
         }
         
         if (!window.cancelAnimationFrame) {
             window.cancelAnimationFrame = function(id) {
                 clearTimeout(id);
             };
         }
     })();
     
     (function ($) {
         $.snowfall = function (container, options) {
             var config = $.extend({}, {
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
                 deviceorientation: true,
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
             var isPaused = false;
             var containerElement = $(container);
             
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
                 this.twinkleOffset = random(0, 100);
                 this.twinkleSpeed = random(2, 4) / 100;
                 this.gradientStep = random(0, 100);
                 this.gradientSpeed = random(2, 6) / 100;
                 
                 this.element = document.createElement("div");
                 this.element.className = "snowfall-flake";
                 
                 var styles = {
                     width: this.size + "px",
                     height: this.size + "px",
                     position: config.flakePosition,
                     top: this.y + "px",
                     left: this.x + "px",
                     borderRadius: "50%",
                     opacity: this.opacity,
                     zIndex: config.flakeIndex,
                     pointerEvents: "none",
                     userSelect: "none",
                     transition: "opacity 0.3s ease"
                 };
                 
                 styles.boxShadow = "1px 1px 3px rgba(0,0,0,0.3)";
                 styles.background = `radial-gradient(circle at 30% 30%, 
                            rgba(255,255,255,${this.opacity}), 
                            rgba(200,200,255,${this.opacity * 0.3}))`;
                 
                 $(this.element).css(styles);
                 
                 // ВСЕГДА добавляем в контейнер, а не в body
                 containerElement.append(this.element);
                 
                 this.update = function() {
                     if (isPaused) return;
                     
                     this.y += this.speed + Math.sin(this.step) * 0.3;
                     this.step += this.stepSize;
                     this.x += wind + Math.cos(this.step) * 0.8;
                     this.x += Math.sin(this.step + this.swingOffset) * this.swingSpeed;
                     
                     var twinkle = Math.sin(this.twinkleOffset + this.step * this.twinkleSpeed);
                     this.element.style.opacity = (this.opacity * (0.6 + twinkle * 0.4)).toFixed(2);
                     
                     this.gradientStep += this.gradientSpeed;
                     var gradientPos = Math.sin(this.gradientStep) * 20 + 30;
                     this.element.style.background = `radial-gradient(circle at ${gradientPos}% ${gradientPos}%, 
                                            rgba(255,255,255,${this.opacity}), 
                                            rgba(180,180,255,${this.opacity * 0.4}))`;
                     
                     var containerWidth = containerElement.width();
                     var containerHeight = containerElement.height();
                     var margin = 25;
                     
                     if (this.y > containerHeight - (this.size + 10)) {
                         this.melt();
                     }
                     
                     if (this.x > containerWidth + margin) {
                         this.x = -margin;
                     } else if (this.x < -margin) {
                         this.x = containerWidth + margin;
                     }
                     
                     this.element.style.top = this.y + "px";
                     this.element.style.left = this.x + "px";
                 };
                 
                 this.melt = function() {
                     var meltInterval = setInterval(() => {
                         this.opacity -= 0.08;
                         this.element.style.opacity = this.opacity;
                         
                         if (this.opacity <= 0) {
                             clearInterval(meltInterval);
                             this.reset();
                         }
                     }, 80);
                 };
                 
                 this.reset = function() {
                     this.y = -this.size;
                     this.x = random(-50, containerElement.width() + 50);
                     this.stepSize = random(1, 15) / 100;
                     this.size = random(config.minSize * 100, config.maxSize * 100) / 100;
                     this.speed = random(config.minSpeed, config.maxSpeed);
                     this.opacity = random(6, 10) / 10;
                     this.swingOffset = random(0, Math.PI * 2);
                     
                     this.element.style.width = this.size + "px";
                     this.element.style.height = this.size + "px";
                     this.element.style.opacity = this.opacity;
                 };
                 
                 this.destroy = function() {
                     if (this.element && this.element.parentNode) {
                         $(this.element).remove();
                     }
                 };
             }
             
             function random(min, max) {
                 return Math.floor(Math.random() * (max - min + 1)) + min;
             }
             
             function updateWind() {
                 wind = 0.3 + Math.sin(Date.now() * 0.001) * 0.4;
             }
             
             function animate() {
                 updateWind();
                 
                 for (var i = 0; i < flakes.length; i++) {
                     flakes[i].update();
                 }
                 
                 if (!isPaused) {
                     animationId = requestAnimationFrame(animate);
                 }
             }
             
             function init() {
                 var containerWidth = containerElement.width();
                 var containerHeight = containerElement.height();
                 
                 for (var i = 0; i < config.flakeCount; i++) {
                     flakes.push(new Snowflake(
                                               random(-100, containerWidth + 100),
                                               random(-200, containerHeight),
                                               random(config.minSize * 100, config.maxSize * 100) / 100,
                                               random(config.minSpeed, config.maxSpeed)
                                               ));
                 }
                 
                 animate();
             }
             
             this.clear = function() {
                 isPaused = true;
                 if (animationId) {
                     cancelAnimationFrame(animationId);
                     animationId = 0;
                 }
                 
                 for (var i = 0; i < flakes.length; i++) {
                     if (flakes[i] && flakes[i].destroy) {
                         flakes[i].destroy();
                     }
                 }
                 
                 flakes = [];
             };
             
             containerElement.data("snowfall", this);
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
     
     // Система управления снегом
     (function () {
         'use strict';
         
         function initializeSnow() {
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
                 onChange: function (value) {
                     Lampa.Storage.set("Snow", value);

                     if (value) {
                         setTimeout(enableSnow, 100);
                     } else {
                         try {
                             // Находим все активные snowfall-инстансы и завершаем их
                             $(".background").each(function () {
                                 var instance = $(this).data("snowfall");
                                 if (instance) {
                                     // Безопасно останавливаем анимацию
                                     instance.isPaused = true;

                                     if (instance.animationId) {
                                         cancelAnimationFrame(instance.animationId);
                                         instance.animationId = 0;
                                     }

                                     if (typeof instance.clear === "function") {
                                         instance.clear();
                                     }
                                 }
                             });

                             // Удаляем остатки снежинок из DOM
                             $(".snowfall-flake").remove();

                             Lampa.Noty.show("Снегопад отключен");
                         } catch (e) {
                             console.error("Ошибка при остановке снега:", e);
                         }
                     }
                 },


                 onRender: function (element) {
                     setTimeout(function () {
                         $("div[data-name=\"Snow\"]").insertAfter("div[data-name=\"black_style\"]");
                     }, 0);
                 }
             });
             
             // Автозапуск если включено
             if (Lampa.Storage.field("Snow") !== false) {
                 setTimeout(enableSnow, 1500);
             }
         }
         
         function enableSnow() {
             try {
                 // Очищаем старый снег, если есть
                 $(".background").each(function () {
                     var instance = $(this).data("snowfall");
                     if (instance && typeof instance.clear === "function") {
                         instance.clear();
                     }
                 });
                 $(".snowfall-flake").remove();

                 // Запускаем новый снегопад
                 var blizzardConfig = {
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

                 $(".background").snowfall(blizzardConfig);
             } catch (error) {
                 console.error("Snow initialization error:", error);
             }
         }

         
         if (window.appready) {
             initializeSnow();
         } else {
             Lampa.Listener.follow("app", function (event) {
                 if (event.type == "ready") {
                     initializeSnow();
                 }
             });
         }
         
     })();
     
 })();
