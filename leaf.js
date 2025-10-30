 (function () {
   'use strict';

   Lampa.Platform.tv();

   (function ($) {
     $.autumnLeaves = function (element, options) {
       let leaves = [];
       let animationFrame;
       const container = element;

       const settings = $.extend({
         leafCount: 40,
         minSize: 8,
         maxSize: 15,
         minSpeed: 0.5,
         maxSpeed: 2,
         colors: ['#FF6B35', '#FFA62B', '#D4A76A', '#8B4513', '#CD853F', '#DA9100'],
         leafPosition: 'absolute',
         leafIndex: 999999
       }, options);

       function random(a, b) {
         return a + Math.random() * (b - a);
       }

       function Leaf() {
         this.size = random(settings.minSize, settings.maxSize);
         this.speed = random(settings.minSpeed, settings.maxSpeed);
         this.x = random(0, window.innerWidth);
         this.y = random(-40, 0); // старт чуть выше экрана
         this.step = 0;
         this.stepSize = random(0.01, 0.05);
         this.rotation = random(0, 360);
         this.rotationSpeed = random(-2, 2);
         const color = settings.colors[Math.floor(random(0, settings.colors.length))];

         const el = document.createElement("div");
         this.element = el;

         $(el).addClass("autumn-leaf").css({
           width: this.size + "px",
           height: this.size + "px",
           position: settings.leafPosition,
           top: this.y + "px",
           left: this.x + "px",
           background: color,
           borderRadius: '50% 0 50% 0',
           zIndex: settings.leafIndex,
           transform: `rotate(${this.rotation}deg)`,
           transition: 'transform 0.1s linear'
         });

         $(container).append($(el));

         this.update = () => {
           this.y += this.speed;
           this.x += Math.cos(this.step) * 0.5;
           this.step += this.stepSize;
           this.rotation += this.rotationSpeed;

           this.element.style.top = this.y + "px";
           this.element.style.left = this.x + "px";
           this.element.style.transform = `rotate(${this.rotation}deg)`;

           if (this.y > window.innerHeight) {
             this.y = -this.size;
             this.x = random(0, window.innerWidth);
             this.speed = random(settings.minSpeed, settings.maxSpeed);
           }
         };
       }

       function animate() {
         leaves.forEach(l => l.update());
         animationFrame = requestAnimationFrame(animate);
       }

       for (let i = 0; i < settings.leafCount; i++) {
         leaves.push(new Leaf());
       }

       animate();

       this.clear = () => {
         leaves.forEach(l => $(l.element).remove());
         cancelAnimationFrame(animationFrame);
       };

       $(container).data("autumnLeaves", this);
     };

     $.fn.autumnLeaves = function (optionsOrMethod) {
       if (typeof optionsOrMethod === "object" || optionsOrMethod === undefined) {
         return this.each(function () { new $.autumnLeaves(this, optionsOrMethod); });
       } else if (typeof optionsOrMethod === "string") {
         return this.each(function () {
           const instance = $(this).data("autumnLeaves");
           if (instance && typeof instance[optionsOrMethod] === "function") instance[optionsOrMethod]();
         });
       }
     };
   })(jQuery);

   (function () {
     function initLeaves() {
       Lampa.SettingsApi.addParam({
         component: "interface",
         param: { name: "AutumnLeaves", type: "trigger", default: true },
         field: { name: "Показывать осенние листья" },
         onChange: function () {
           if (Lampa.Storage.field("AutumnLeaves")) showLeaves();
           else hideLeaves();
         },
         onRender: function () {
           setTimeout(() => {
             $("div[data-name='AutumnLeaves']").insertAfter("div[data-name='black_style']");
           }, 0);
         }
       });

       if (Lampa.Storage.field("AutumnLeaves")) showLeaves();
       else hideLeaves();

       function showLeaves() {
         window.autumn = true;
         if ($(".autumn-leaves-wrapper").length === 0) {
           $("<div class='autumn-leaves-wrapper'></div>").appendTo("body").autumnLeaves({
             leafCount: 40,
             minSize: 8,
             maxSize: 15,
             minSpeed: 0.5,
             maxSpeed: 2
           });
         }
       }

       function hideLeaves() {
         window.autumn = false;
         $(".autumn-leaves-wrapper").each(function () {
           $(this).autumnLeaves("clear");
         });
       }
     }

     if (window.appready) initLeaves();
     else Lampa.Listener.follow("app", b => {
       if (b.type === "ready") initLeaves();
     });
   })();
 })();
