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
          return (
            setTimeout(function () {
              a(h = c);
            }, c - b)
          );
        };
        window.cancelAnimationFrame = clearTimeout;
      }
    })();

    (function (a) {
      a.snowfall = function (b, c) {
        function d(d, e, f, g) {
          this.x = d;
          this.y = e;
          this.size = f;
          this.speed = g;
          this.step = 0;
          this.stepSize = i(1, 10) / 100;
          this.rotation = i(0, 360);
          this.rotationSpeed = i(-0.5, 0.5);
          if (c.collection) {
            this.target = p[i(0, p.length - 1)];
          }

          var j = document.createElement("div");
          // Цвета снежинок
          var snowColors = ['#FFFFFF', '#E0F7FA', '#E3F2FD', '#F0F8FF', '#F8FBFF'];
          var randomColor = snowColors[i(0, snowColors.length - 1)];

          a(j).attr({
            class: "snowfall-flake"
          }).css({
            background: randomColor,
            borderRadius: '50%',
            position: c.flakePosition,
            top: this.y,
            left: this.x,
            width: this.size,
            height: this.size,
            opacity: i(7, 10) / 10,
            boxShadow: "0 0 10px rgba(255,255,255,0.8)",
            zIndex: c.flakeIndex,
            transformOrigin: 'center center',
            transition: 'transform 0.1s linear'
          });

          if (a(b).get(0).tagName === a(document).get(0).tagName) {
            a("body").append(a(j));
            b = a("body");
          } else {
            a(b).append(a(j));
          }

          this.element = j;

          this.update = function () {
            this.y += this.speed;
            if (this.y > k - (this.size + 6)) {
              this.reset();
            }

            this.element.style.top = this.y + "px";
            this.element.style.left = this.x + "px";
            this.step += this.stepSize;
            this.rotation += this.rotationSpeed;

            // Плавное покачивание снежинки
            this.x += Math.cos(this.step) * 0.5;

            if (this.x + this.size > l - m || this.x < m) {
              this.reset();
            }
          };

          this.reset = function () {
            this.y = 0;
            this.x = i(m, l - m);
            this.stepSize = i(1, 10) / 100;
            this.size = i(c.minSize * 100, c.maxSize * 100) / 100;
            this.rotation = i(0, 360);
            this.rotationSpeed = i(-0.5, 0.5);
            this.element.style.width = this.size + "px";
            this.element.style.height = this.size + "px";
            this.speed = i(c.minSpeed, c.maxSpeed);
            var randomColor = snowColors[i(0, snowColors.length - 1)];
            this.element.style.background = randomColor;
          };
        }

        function e() {
          for (j = 0; j < g.length; j += 1) {
            g[j].update();
          }
          n = requestAnimationFrame(function () {
            e();
          });
        }

        var f = {
          flakeCount: 40, // немного больше снежинок
          flakeColor: "#FFFFFF",
          flakePosition: "absolute",
          flakeIndex: 999999,
          minSize: 4,
          maxSize: 10,
          minSpeed: 0.3,
          maxSpeed: 1.2,
          collection: false,
          deviceorientation: false
        };

        var g = [];
        var h = f;
        var c = a.extend(h, c);

        function i(a, b) {
          return Math.round(a + Math.random() * (b - a));
        }

        a(b).data("snowfall", this);
        var j = 0;
        var k = a(b).height();
        var l = a(b).width();
        var m = 0;
        var n = 0;

        if (a(b).get(0).tagName === a(document).get(0).tagName) {
          m = 25;
        }

        a(window).bind("resize", function () {
          k = a(b)[0].clientHeight;
          l = a(b)[0].offsetWidth;
        });

        j = 0;
        for (; j < c.flakeCount; j += 1) {
          g.push(new d(i(m, l - m), i(0, k), i(c.minSize * 100, c.maxSize * 100) / 100, i(c.minSpeed, c.maxSpeed)));
        }

        e();

        this.clear = function () {
          a(b).children(".snowfall-flake").remove();
          cancelAnimationFrame(n);
        };
      };

      a.fn.snowfall = function (b) {
        if (typeof b == "object" || b == undefined) {
          return this.each(function (c) {
            new a.snowfall(this, b);
          });
        } else if (typeof b == "string") {
          return this.each(function (b) {
            var c = a(this).data("snowfall");
            if (c) {
              c.clear();
            }
          });
        } else {
          return undefined;
        }
      };
    })(jQuery);

    (function () {
      'use strict';

      function a() {
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
          onChange: function (c) {
            if (Lampa.Storage.field("WinterSnow") == true) {
              showSnow();
            } else {
              hideSnow();
            }
          },
          onRender: function (a) {
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
          var a = {
            minSize: 4,
            maxSize: 10,
            minSpeed: 0.3,
            maxSpeed: 1.2,
            flakeCount: 40
          };
          $(".background").snowfall(a);
        }

        function hideSnow() {
          window.winter = false;
          $(".background").snowfall("clear");
        }
      }

      if (window.appready) {
        a();
      } else {
        Lampa.Listener.follow("app", function (b) {
          if (b.type == "ready") {
            a();
          }
        });
      }
    })();
  })();
