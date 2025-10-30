 (function () {
   'use strict';

   Lampa.Platform.tv();

   (function (a) {
     a.garland = function (b, c) {
       let bulbs = [];
       let interval;

       function createBulbs() {
         var count = c.bulbCount;
         var colors = ['#FF0000', '#00FF00', '#FFD700', '#00BFFF', '#FF69B4', '#FF8C00'];

         for (let i = 0; i < count; i++) {
           let bulb = document.createElement("div");
           let color = colors[Math.floor(Math.random() * colors.length)];

           a(bulb).addClass("garland-bulb").css({
             backgroundColor: color,
             width: c.bulbSize + "px",
             height: c.bulbSize + "px",
             borderRadius: "50%",
             position: "absolute",
             top: "0px",
             left: (i * (window.innerWidth / count)) + "px",
             boxShadow: `0 0 15px ${color}`,
             transform: `translateY(${Math.sin(i) * 3}px)`,
             transition: "opacity 0.3s, box-shadow 0.3s, transform 1s ease-in-out",
             opacity: 1
           });

           a(b).append(a(bulb));
           bulbs.push(bulb);
         }

         animateBulbs();
       }

       function animateBulbs() {
         interval = setInterval(() => {
           bulbs.forEach((bulb, i) => {
             let opacity = Math.random() * 0.5 + 0.5;
             let shift = Math.sin(Date.now() / 1000 + i) * 3;
             bulb.style.opacity = opacity;
             bulb.style.transform = `translateY(${shift}px)`;
             bulb.style.boxShadow = `0 0 ${10 + Math.random() * 10}px ${bulb.style.backgroundColor}`;
           });
         }, 300);
       }

       a(b).addClass("garland-container").css({
         position: "fixed",
         top: "0",
         left: "0",
         width: "100%",
         height: "40px",
         zIndex: 999999,
         pointerEvents: "none",
         overflow: "hidden"
       });

       createBulbs();

       // ✅ Сохраняем экземпляр, чтобы clear() работал
       a(b).data("garland", this);

       this.clear = function () {
         clearInterval(interval);
         a(b).remove();
       };
     };

     a.fn.garland = function (b) {
       if (typeof b == "object" || b == undefined) {
         return this.each(function () {
           new a.garland(this, b);
         });
       } else if (typeof b == "string") {
         return this.each(function () {
           var instance = a(this).data("garland");
           if (instance) instance.clear();
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
         var options = {
           bulbCount: 40,
           bulbSize: 14
         };
         if ($(".garland-wrapper").length === 0) {
           $("<div class='garland-wrapper'></div>").appendTo("body").garland(options);
         }
       }

       function hideGarland() {
         window.garland = false;
         $(".garland-wrapper").garland("clear");
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
