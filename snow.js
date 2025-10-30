 (function () {
   'use strict';

   Lampa.Platform.tv();

   (function ($) {
     $.snowfall = function (element, options) {
       const defaults = {
         flakeCount: 80,
         minSize: 4,
         maxSize: 15,
         minSpeed: 0.3,
         maxSpeed: 1.2,
         flakeIndex: 999999,
         flakePosition: "absolute"
       };

       options = $.extend({}, defaults, options);

       let flakes = [];
       let animationFrame;
       let width = $(element).width();
       let height = $(element).height();

       const colors = ['#FFFFFF', '#E0F7FA', '#E3F2FD', '#F0F8FF', '#F8FBFF'];

       function random(a, b) {
         return a + Math.random() * (b - a);
       }

       function Snowflake() {
         this.size = random(options.minSize, options.maxSize);
         this.speed = random(options.minSpeed, options.maxSpeed);
         this.x = random(0, width);
         this.y = random(0, height);
         this.step = 0;
         this.stepSize = random(0.01, 0.1);
         this.rotation = random(0, 360);
         this.rotationSpeed = random(-0.5, 0.5);

         const el = document.createElement("div");
         this.element = el;

         $(el).addClass("snowfall-flake").css({
           position: options.flakePosition,
           width: this.size + "px",
           height: this.size + "px",
           top: this.y + "px",
           left: this.x + "px",
           borderRadius: "50%",
           background: colors[Math.floor(random(0, colors.length))],
           opacity: random(0.7, 1),
           zIndex: options.flakeIndex,
           boxShadow: "none", // убрали свечение
           transformOrigin: "center center"
         });

         $(element).append($(el));

         this.update = () => {
           // постоянное падение
           this.y += this.speed;
           this.x += Math.cos(this.step) * 0.5;
           this.step += this.stepSize;
           this.rotation += this.rotationSpeed;

           this.element.style.top = this.y + "px";
           this.element.style.left = this.x + "px";
           this.element.style.transform = 'rotate(' + this.rotation + 'deg)';

           // ресет, когда снежинка ушла за низ
           if (this.y > height) {
             this.y = -this.size; // старт немного выше экрана
             this.x = random(0, width);
             this.speed = random(options.minSpeed, options.maxSpeed);
           }
         };
       }

       function animate() {
         flakes.forEach(f => f.update());
         animationFrame = requestAnimationFrame(animate);
       }

       for (let i = 0; i < options.flakeCount; i++) {
         flakes.push(new Snowflake());
       }

       animate();

       $(window).on("resize", () => {
         width = $(element).width();
         height = $(element).height();
       });

       this.clear = () => {
         flakes.forEach(f => $(f.element).remove());
         cancelAnimationFrame(animationFrame);
       };

       $(element).data("snowfall", this);
     };

     $.fn.snowfall = function (opt) {
       if (typeof opt === "object" || opt === undefined) {
         return this.each(function () { new $.snowfall(this, opt); });
       } else if (typeof opt === "string") {
         return this.each(function () {
           const inst = $(this).data("snowfall");
           if (inst && typeof inst.clear === "function") inst.clear();
         });
       }
     };
   })(jQuery);

   (function () {
     function initSnow() {
       Lampa.SettingsApi.addParam({
         component: "interface",
         param: { name: "WinterSnow", type: "trigger", default: true },
         field: { name: "Показывать снег" },
         onChange: function () {
           if (Lampa.Storage.field("WinterSnow")) showSnow();
           else hideSnow();
         },
         onRender: function () {
           setTimeout(() => {
             $("div[data-name='WinterSnow']").insertAfter("div[data-name='black_style']");
           }, 0);
         }
       });

       if (Lampa.Storage.field("WinterSnow")) showSnow();
       else hideSnow();

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

     if (window.appready) initSnow();
     else Lampa.Listener.follow("app", b => {
       if (b.type === "ready") initSnow();
     });
   })();
 })();
