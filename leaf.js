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
         leafSize: 20,
         colors: ['#FF6B35', '#FFA62B', '#D4A76A', '#8B4513', '#CD853F', '#DA9100'],
         top: true // true = сверху, false = снизу
       }, options);

       function createLeaves() {
         const containerHeight = settings.top ? 0 : window.innerHeight - settings.leafSize;
         for (let i = 0; i < settings.leafCount; i++) {
           const leaf = document.createElement("div");
           const color = settings.colors[Math.floor(Math.random() * settings.colors.length)];

           $(leaf).addClass("leaf-garland").css({
             backgroundColor: color,
             width: settings.leafSize + "px",
             height: settings.leafSize + "px",
             borderRadius: "50% 0 50% 0",
             position: "fixed",
             top: containerHeight + "px",
             left: (i * (window.innerWidth / settings.leafCount)) + "px",
             transition: "opacity 0.5s, transform 1s ease-in-out",
             opacity: 1
           });

           $(container).append($(leaf));
           leaves.push(leaf);
         }

         animateLeaves();
       }

       function animateLeaves() {
         interval = setInterval(() => {
           leaves.forEach((leaf, i) => {
             const shift = Math.sin(Date.now() / 1000 + i) * 5;
             const opacity = 0.7 + Math.random() * 0.3;
             leaf.style.transform = `translateY(${shift}px)`;
             leaf.style.opacity = opacity;
           });
         }, 200);
       }

       this.clear = function () {
         clearInterval(interval);
         $(container).remove();
       };

       $(container).addClass("leaf-garland-container").css({
         position: "fixed",
         top: settings.top ? "0" : "auto",
         bottom: settings.top ? "auto" : "0",
         left: "0",
         width: "100%",
         height: settings.leafSize + "px",
         zIndex: 999999,
         pointerEvents: "none",
         overflow: "hidden"
       });

       createLeaves();
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
           $("<div class='leaf-garland-wrapper-top'></div>").appendTo("body").leafGarland({ top: true, leafCount: 20, leafSize: 20 });
         }
         if ($(".leaf-garland-wrapper-bottom").length === 0) {
           $("<div class='leaf-garland-wrapper-bottom'></div>").appendTo("body").leafGarland({ top: false, leafCount: 20, leafSize: 20 });
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
