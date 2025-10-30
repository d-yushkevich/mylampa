 (function () {
   'use strict';

   Lampa.Platform.tv();

   (function ($) {
     $.leafGarland = function (element, options) {
       let leaves = [];
       let interval;
       const container = element;

       const settings = $.extend({
         leafCount: 20,
         leafSizeMin: 20,
         leafSizeMax: 40,
         colors: ['#FF6B35', '#FFA62B', '#D4A76A', '#8B4513', '#CD853F', '#DA9100'],
         top: true
       }, options);

       function random(a, b) {
         return a + Math.random() * (b - a);
       }

       function createLeaf(i) {
         const leaf = document.createElement("div");
         const color = settings.colors[Math.floor(random(0, settings.colors.length))];
         const size = random(settings.leafSizeMin, settings.leafSizeMax);

         $(leaf).addClass("leaf-garland-leaf").css({
           width: size + "px",
           height: size + "px",
           position: "fixed",
           top: settings.top ? "0px" : "auto",
           bottom: settings.top ? "auto" : "0px",
           left: (i * (window.innerWidth / settings.leafCount)) + "px",
           backgroundColor: color,
           borderRadius: "50% 20% 50% 20%", // имитация листа
           transform: `rotate(${random(-30, 30)}deg)`,
           transition: "transform 1s ease-in-out, opacity 0.5s",
           opacity: random(0.7, 1),
           zIndex: 999999,
           pointerEvents: "none"
         });

         $(container).append($(leaf));
         leaves.push({ el: leaf, shift: random(0.5, 2), rotationDir: Math.random() > 0.5 ? 1 : -1 });
       }

       function animateLeaves() {
         interval = setInterval(() => {
           leaves.forEach(l => {
             const shiftY = Math.sin(Date.now() / 1000 * l.shift) * 5;
             const rotation = parseFloat(l.el.style.transform.replace(/[^\d.-]/g, '')) + l.rotationDir * 2;
             l.el.style.transform = `rotate(${rotation}deg) translateY(${shiftY}px)`;
             l.el.style.opacity = 0.7 + Math.random() * 0.3;
           });
         }, 200);
       }

       for (let i = 0; i < settings.leafCount; i++) {
         createLeaf(i);
       }

       animateLeaves();

       this.clear = function () {
         clearInterval(interval);
         $(container).remove();
       };

       $(container).data("leafGarland", this);
     };

     $.fn.leafGarland = function (optionsOrMethod) {
       if (typeof optionsOrMethod === "object" || optionsOrMethod === undefined) {
         return this.each(function () { new $.leafGarland(this, optionsOrMethod); });
       } else if (typeof optionsOrMethod === "string") {
         return this.each(function () {
           const instance = $(this).data("leafGarland");
           if (instance && typeof instance[optionsOrMethod] === "function") instance[optionsOrMethod]();
         });
       }
     };
   })(jQuery);

   (function () {
     function initLeafGarland() {
       Lampa.SettingsApi.addParam({
         component: "interface",
         param: { name: "LeafGarland", type: "trigger", default: true },
         field: { name: "Показывать осеннюю гирлянду" },
         onChange: function () {
           if (Lampa.Storage.field("LeafGarland")) showGarland();
           else hideGarland();
         },
         onRender: function () {
           setTimeout(() => {
             $("div[data-name='LeafGarland']").insertAfter("div[data-name='black_style']");
           }, 0);
         }
       });

       if (Lampa.Storage.field("LeafGarland")) showGarland();
       else hideGarland();

       function showGarland() {
         window.leafGarland = true;
         if ($(".leaf-garland-wrapper-top").length === 0) {
           $("<div class='leaf-garland-wrapper-top'></div>").appendTo("body").leafGarland({ top: true, leafCount: 20 });
         }
         if ($(".leaf-garland-wrapper-bottom").length === 0) {
           $("<div class='leaf-garland-wrapper-bottom'></div>").appendTo("body").leafGarland({ top: false, leafCount: 20 });
         }
       }

       function hideGarland() {
         window.leafGarland = false;
         $(".leaf-garland-wrapper-top, .leaf-garland-wrapper-bottom").each(function () {
           $(this).leafGarland("clear");
         });
       }
     }

     if (window.appready) initLeafGarland();
     else Lampa.Listener.follow("app", b => {
       if (b.type === "ready") initLeafGarland();
     });
   })();
 })();
