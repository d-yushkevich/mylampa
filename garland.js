 (function () {
   'use strict';

   Lampa.Platform.tv();

   (function ($) {
     $.garland = function (element, options) {
       let bulbs = [];
       let interval;
       const container = element;

       const settings = $.extend({
         bulbCount: 40,
         bulbSize: 14,
         colors: ['#FF0000', '#00FF00', '#FFD700', '#00BFFF', '#FF69B4', '#FF8C00']
       }, options);

       function createBulbs() {
         for (let i = 0; i < settings.bulbCount; i++) {
           const bulb = document.createElement("div");
           const color = settings.colors[Math.floor(Math.random() * settings.colors.length)];

           $(bulb).addClass("garland-bulb").css({
             backgroundColor: color,
             width: settings.bulbSize + "px",
             height: settings.bulbSize + "px",
             borderRadius: "50%",
             position: "absolute",
             top: "0px",
             left: (i * (window.innerWidth / settings.bulbCount)) + "px",
             boxShadow: `0 0 15px ${color}`,
             transform: `translateY(${Math.sin(i) * 3}px)`,
             transition: "opacity 0.3s, box-shadow 0.3s, transform 1s ease-in-out",
             opacity: 1
           });

           $(container).append($(bulb));
           bulbs.push(bulb);
         }

         animateBulbs();
       }

       function animateBulbs() {
         interval = setInterval(() => {
           bulbs.forEach((bulb, i) => {
             const opacity = Math.random() * 0.5 + 0.5;
             const shift = Math.sin(Date.now() / 1000 + i) * 3;
             bulb.style.opacity = opacity;
             bulb.style.transform = `translateY(${shift}px)`;
             bulb.style.boxShadow = `0 0 ${10 + Math.random() * 10}px ${bulb.style.backgroundColor}`;
           });
         }, 300);
       }

       this.clear = function () {
         clearInterval(interval);
         $(container).remove();
       };

       $(container).addClass("garland-container").css({
         position: "fixed",
         top: options.position === "bottom" ? "auto" : "0",
         bottom: options.position === "bottom" ? "0" : "auto",
         left: "0",
         width: "100%",
         height: "40px",
         zIndex: 999999,
         pointerEvents: "none",
         overflow: "hidden"
       });

       createBulbs();
       $(container).data("garland", this);
     };

     $.fn.garland = function (optionsOrMethod) {
       if (typeof optionsOrMethod === "object" || optionsOrMethod === undefined) {
         return this.each(function () {
           new $.garland(this, optionsOrMethod);
         });
       } else if (typeof optionsOrMethod === "string") {
         return this.each(function () {
           const instance = $(this).data("garland");
           if (instance && typeof instance[optionsOrMethod] === "function") {
             instance[optionsOrMethod]();
           }
         });
       }
     };
   })(jQuery);

   (function () {
     'use strict';

     function initGarland() {
       Lampa.SettingsApi.addParam({
         component: "interface",
         param: {
           name: "NewYearGarland",
           type: "trigger",
           default: true
         },
         field: {
           name: "Показывать новогоднюю гирлянду"
         },
         onChange: function () {
           if (Lampa.Storage.field("NewYearGarland") === true) {
             showGarland();
           } else {
             hideGarland();
           }
         },
         onRender: function () {
           setTimeout(function () {
             $("div[data-name='NewYearGarland']").insertAfter("div[data-name='black_style']");
           }, 0);
         }
       });

       if (Lampa.Storage.field("NewYearGarland") === true) {
         showGarland();
       } else {
         hideGarland();
       }

       function showGarland() {
         window.garland = true;
         const optionsTop = { bulbCount: 40, bulbSize: 14, position: "top" };
         const optionsBottom = { bulbCount: 40, bulbSize: 14, position: "bottom" };

         if ($(".garland-top").length === 0) {
           $("<div class='garland-wrapper garland-top'></div>").appendTo("body").garland(optionsTop);
         }

         if ($(".garland-bottom").length === 0) {
           $("<div class='garland-wrapper garland-bottom'></div>").appendTo("body").garland(optionsBottom);
         }
       }

       function hideGarland() {
         window.garland = false;
         $(".garland-wrapper").each(function () {
           $(this).garland("clear");
         });
       }
     }

     if (window.appready) {
       initGarland();
     } else {
       Lampa.Listener.follow("app", function (b) {
         if (b.type === "ready") {
           initGarland();
         }
       });
     }
   })();
 })();
