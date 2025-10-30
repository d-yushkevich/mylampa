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
        return (// TOLOOK
          setTimeout(function () {
            a(h = c);
          }, c - b)
        );
      };
      window.cancelAnimationFrame = clearTimeout;
    }
  })();
  (function (a) {
    a.leaffall = function (b, c) {
      function d(d, e, f, g) {
        this.x = d;
        this.y = e;
        this.size = f;
        this.speed = g;
        this.step = 0;
        this.stepSize = i(1, 10) / 100;
        this.rotation = i(0, 360);
        this.rotationSpeed = i(-2, 2);
        if (c.collection) {
          this.target = p[i(0, p.length - 1)];
        }
        var j = null;
        if (c.image) {
          j = document.createElement("img");
          j.src = c.image;
        } else {
          j = document.createElement("div");
          // Осенние цвета листьев
          var leafColors = ['#FF6B35', '#FFA62B', '#D4A76A', '#8B4513', '#CD853F', '#DA9100'];
          var randomColor = leafColors[i(0, leafColors.length - 1)];
          a(j).css({
            background: randomColor,
            borderRadius: '50% 0 50% 0',
            transform: 'rotate(' + this.rotation + 'deg)'
          });
        }
        a(j).attr({
          class: "leaffall-leaves"
        }).css({
          width: this.size,
          height: this.size,
          position: c.leafPosition,
          top: this.y,
          left: this.x,
          fontSize: 0,
          zIndex: c.leafIndex,
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
          this.element.style.transform = 'rotate(' + this.rotation + 'deg)';
          
          // Более плавное движение листьев
          if (w === false) {
            this.x += Math.cos(this.step) * 0.5;
          } else {
            this.x += (w * 0.5) + Math.cos(this.step) * 0.5;
          }
          
          if (c.collection && this.x > this.target.x && this.x < this.target.width + this.target.x && this.y > this.target.y && this.y < this.target.height + this.target.y) {
            var a = this.target.element.getContext("2d");
            var b = this.x - this.target.x;
            var d = this.y - this.target.y;
            var e = this.target.colData;
            if (e[parseInt(b)][parseInt(d + this.speed + this.size)] !== undefined || d + this.speed + this.size > this.target.height) {
              if (d + this.speed + this.size > this.target.height) {
                for (; d + this.speed + this.size > this.target.height && this.speed > 0;) {
                  this.speed *= 0.5;
                }
                a.fillStyle = h.leafColor;
                if (e[parseInt(b)][parseInt(d + this.speed + this.size)] == undefined) {
                  e[parseInt(b)][parseInt(d + this.speed + this.size)] = 1;
                  a.fillRect(b, d + this.speed + this.size, this.size, this.size);
                } else {
                  e[parseInt(b)][parseInt(d + this.speed)] = 1;
                  a.fillRect(b, d + this.speed, this.size, this.size);
                }
                this.reset();
              } else {
                this.speed = 1;
                this.stepSize = 0;
                if (parseInt(b) + 1 < this.target.width && e[parseInt(b) + 1][parseInt(d) + 1] == undefined) {
                  this.x++;
                } else if (parseInt(b) - 1 > 0 && e[parseInt(b) - 1][parseInt(d) + 1] == undefined) {
                  this.x--;
                } else {
                  a.fillStyle = h.leafColor;
                  a.fillRect(b, d, this.size, this.size);
                  e[parseInt(b)][parseInt(d)] = 1;
                  this.reset();
                }
              }
            }
          }
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
          this.rotationSpeed = i(-2, 2);
          this.element.style.width = this.size + "px";
          this.element.style.height = this.size + "px";
          this.speed = i(c.minSpeed, c.maxSpeed);
          // Случайный осенний цвет при ресете
          var leafColors = ['#FF6B35', '#FFA62B', '#D4A76A', '#8B4513', '#CD853F', '#DA9100'];
          var randomColor = leafColors[i(0, leafColors.length - 1)];
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
        leafCount: 25, // Меньше листьев для более естественного вида
        leafColor: "#FFA62B", // Оранжевый по умолчанию
        leafPosition: "absolute",
        leafIndex: 999999,
        minSize: 8, // Больший размер для листьев
        maxSize: 15,
        minSpeed: 0.5, // Медленнее падение
        maxSpeed: 2,
        round: false, // Не круглые
        shadow: true, // Тень для объема
        collection: false,
        collectionHeight: 40,
        deviceorientation: true
      };
      var g = [];
      var h = f;
      var c = a.extend(h, c);
      function i(a, b) {
        return Math.round(a + Math.random() * (b - a));
      }
      a(b).data("leaffall", this);
      var j = 0;
      var k = a(b).height();
      var l = a(b).width();
      var m = 0;
      var n = 0;
      if (c.collection !== !1) {
        var o = document.createElement("canvas");
        if (o.getContext && o.getContext("2d")) {
          for (var p = [], q = a(c.collection), r = c.collectionHeight, j = 0; j < q.length; j++) {
            var s = q[j].getBoundingClientRect();
            var t = a("<canvas/>", {
              class: "leaffall-canvas"
            });
            var u = [];
            if (s.top - r > 0) {
              a("body").append(t);
              t.css({
                position: c.leafPosition,
                left: s.left + "px",
                top: s.top - r + "px"
              }).prop({
                width: s.width,
                height: r
              });
              for (var v = 0; v < s.width; v++) {
                u[v] = [];
              }
              p.push({
                element: t.get(0),
                x: s.left,
                y: s.top - r,
                width: s.width,
                height: r,
                colData: u
              });
            }
          }
        } else {
          c.collection = !1;
        }
      }
      if (a(b).get(0).tagName === a(document).get(0).tagName) {
        m = 25;
      }
      a(window).bind("resize", function () {
        k = a(b)[0].clientHeight;
        l = a(b)[0].offsetWidth;
      });
      j = 0;
      for (; j < c.leafCount; j += 1) {
        g.push(new d(i(m, l - m), i(0, k), i(c.minSize * 100, c.maxSize * 100) / 100, i(c.minSpeed, c.maxSpeed)));
      }
      if (c.shadow) {
        a(".leaffall-leaves").css({
          "-moz-box-shadow": "2px 2px 3px rgba(0,0,0,0.3)",
          "-webkit-box-shadow": "2px 2px 3px rgba(0,0,0,0.3)",
          "box-shadow": "2px 2px 3px rgba(0,0,0,0.3)"
        });
      }
      var w = !1;
      if (c.deviceorientation) {
        a(window).bind("deviceorientation", function (a) {
          w = a.originalEvent.gamma * 0.1;
        });
      }
      e();
      this.clear = function () {
        a(".leaffall-canvas").remove();
        a(b).children(".leaffall-leaves").remove();
        cancelAnimationFrame(n);
      };
    };
    a.fn.leaffall = function (b) {
      if (typeof b == "object" || b == undefined) {
        return this.each(function (c) {
          new a.leaffall(this, b);
        });
      } else if (typeof b == "string") {
        return this.each(function (b) {
          var c = a(this).data("leaffall");
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
          name: "AutumnLeaves",
          type: "trigger",
          default: true
        },
        field: {
          name: "Показывать осенние листья"
        },
        onChange: function (c) {
          if (Lampa.Storage.field("AutumnLeaves") == true) {
            a();
          } else {
            b();
          }
        },
        onRender: function (a) {
          // TOLOOK
          setTimeout(function () {
            $("div[data-name=\"AutumnLeaves\"]").insertAfter("div[data-name=\"black_style\"]");
          }, 0);
        }
      });
      if (Lampa.Storage.field("AutumnLeaves") == true) {
        a();
      } else {
        b();
      }
      function a() {
        window.autumn = true;
        var a = {
          deviceorientation: true,
          minSize: 8,
          maxSize: 15,
          minSpeed: 0.5,
          maxSpeed: 2,
          leafCount: 25,
          shadow: true
        };
        $(".background").leaffall(a);
      }
      function b() {
        window.autumn = false;
        $(".background").leaffall("clear");
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
