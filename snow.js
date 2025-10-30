(function () {
  'use strict';

  Lampa.Platform.tv();
  
  // Полифиллы для совместимости
  if (!Date.now) {
    Date.now = function () {
      return new Date().getTime();
    };
  }

  // Улучшенный requestAnimationFrame полифилл
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

  // Улучшенная система снега с эффектами метели
  (function ($) {
    $.snowfall = function (container, options) {
      // Конфигурация для метели
      var config = $.extend({}, {
        flakeCount: 80, // Много снежинок для метели
        flakeColor: "#ffffff",
        flakePosition: "fixed",
        flakeIndex: 999999,
        minSize: 3,
        maxSize: 8,
        minSpeed: 2, // Быстрее для метели
        maxSpeed: 6,
        round: true,
        shadow: true,
        deviceorientation: true,
        wind: true, // Включен ветер
        swing: true,
        opacity: true,
        gradient: true, // Градиент для мерцания
        twinkle: true, // Мерцание
        meltEffect: true // Таяние
      }, options);

      var flakes = [];
      var animationId = 0;
      var wind = 0.5; // Сильный ветер для метели
      var isPaused = false;

      // Функция для создания снежинки
      function Snowflake(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.step = 0;
        this.stepSize = random(1, 15) / 100; // Более хаотичное движение
        this.swingOffset = random(0, Math.PI * 2);
        this.swingSpeed = random(2, 5) / 100; // Быстрее качание
        this.opacity = random(6, 10) / 10;
        this.twinkleOffset = random(0, 100);
        this.twinkleSpeed = random(2, 4) / 100; // Быстрое мерцание
        this.gradientStep = random(0, 100);
        this.gradientSpeed = random(2, 6) / 100;

        // Создание DOM элемента
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

        // Тень для объема
        styles.boxShadow = "1px 1px 3px rgba(0,0,0,0.3)";

        // Градиент для мерцающего эффекта
        styles.background = `radial-gradient(circle at 30% 30%, 
                          rgba(255,255,255,${this.opacity}), 
                          rgba(200,200,255,${this.opacity * 0.3}))`;

        $(this.element).css(styles);

        // Добавление в контейнер
        if ($(container).get(0).tagName === $(document).get(0).tagName) {
          $("body").append(this.element);
          container = $("body");
        } else {
          $(container).append(this.element);
        }

        // Обновление позиции и состояния
        this.update = function() {
          if (isPaused) return;

          // Движение вниз с ускорением для метели
          this.y += this.speed + Math.sin(this.step) * 0.3;
          this.step += this.stepSize;

          // Сильный ветер для метели
          this.x += wind + Math.cos(this.step) * 0.8;

          // Интенсивное качание
          this.x += Math.sin(this.step + this.swingOffset) * this.swingSpeed;

          // Быстрое мерцание
          var twinkle = Math.sin(this.twinkleOffset + this.step * this.twinkleSpeed);
          this.element.style.opacity = (this.opacity * (0.6 + twinkle * 0.4)).toFixed(2);

          // Анимированный градиент
          this.gradientStep += this.gradientSpeed;
          var gradientPos = Math.sin(this.gradientStep) * 20 + 30;
          this.element.style.background = `radial-gradient(circle at ${gradientPos}% ${gradientPos}%, 
                                          rgba(255,255,255,${this.opacity}), 
                                          rgba(180,180,255,${this.opacity * 0.4}))`;

          // Проверка границ
          var containerWidth = $(container).width();
          var containerHeight = $(container).height();
          var margin = 25;

          // Таяние при достижении низа
          if (this.y > containerHeight - (this.size + 10)) {
            this.melt();
          }

          // Переход через границы для непрерывной метели
          if (this.x > containerWidth + margin) {
            this.x = -margin;
          } else if (this.x < -margin) {
            this.x = containerWidth + margin;
          }

          // Обновление позиции
          this.element.style.top = this.y + "px";
          this.element.style.left = this.x + "px";
        };

        // Эффект таяния
        this.melt = function() {
          var meltInterval = setInterval(() => {
            this.opacity -= 0.08; // Быстрое таяние
            this.element.style.opacity = this.opacity;
            
            if (this.opacity <= 0) {
              clearInterval(meltInterval);
              this.reset();
            }
          }, 80);
        };

        // Сброс снежинки
        this.reset = function() {
          this.y = -this.size;
          this.x = random(-50, $(container).width() + 50); // Широкий разброс
          this.stepSize = random(1, 15) / 100;
          this.size = random(config.minSize * 100, config.maxSize * 100) / 100;
          this.speed = random(config.minSpeed, config.maxSpeed);
          this.opacity = random(6, 10) / 10;
          this.swingOffset = random(0, Math.PI * 2);
          
          this.element.style.width = this.size + "px";
          this.element.style.height = this.size + "px";
          this.element.style.opacity = this.opacity;
        };

        // Уничтожение снежинки
        this.destroy = function() {
          $(this.element).remove();
        };
      }

      // Вспомогательные функции
      function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      // Изменение силы ветра для динамики метели
      function updateWind() {
        wind = 0.3 + Math.sin(Date.now() * 0.001) * 0.4;
      }

      // Основной цикл анимации
      function animate() {
        updateWind(); // Обновляем ветер
        
        for (var i = 0; i < flakes.length; i++) {
          flakes[i].update();
        }
        
        if (!isPaused) {
          animationId = requestAnimationFrame(animate);
        }
      }

      // Инициализация снегопада
      function init() {
        var containerWidth = $(container).width();
        var containerHeight = $(container).height();
        
        // Создание снежинок для метели
        for (var i = 0; i < config.flakeCount; i++) {
          flakes.push(new Snowflake(
            random(-100, containerWidth + 100), // Широкий начальный разброс
            random(-200, containerHeight), // Высокий старт
            random(config.minSize * 100, config.maxSize * 100) / 100,
            random(config.minSpeed, config.maxSpeed)
          ));
        }

        // Обработчик изменения размера окна
        $(window).on("resize.snowfall", function() {
          // Адаптация к изменению размера
        });

        // Запуск анимации
        animate();
      }

      // Публичные методы
      this.clear = function() {
        isPaused = true;
        cancelAnimationFrame(animationId);
        
        $(window).off(".snowfall");
        
        for (var i = 0; i < flakes.length; i++) {
          flakes[i].destroy();
        }
        
        flakes = [];
      };

      // Инициализация
      $(container).data("snowfall", this);
      init();
    };

    // jQuery plugin
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

  // Автоматический запуск метели
  (function () {
    'use strict';

    var snowInstance = null;

    function startBlizzard() {
      if (snowInstance) return;
      
      try {
        // Конфигурация для интенсивной метели
        var blizzardConfig = {
          flakeCount: 80,
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
        snowInstance = $(".background").data("snowfall");
        
        console.log("❄️ Метель активирована");
      } catch (error) {
        console.error("Blizzard initialization error:", error);
      }
    }

    function stopBlizzard() {
      if (!snowInstance) return;
      
      try {
        $(".background").snowfall("clear");
        snowInstance = null;
        console.log("Метель остановлена");
      } catch (error) {
        console.error("Blizzard cleanup error:", error);
      }
    }

    // Автоматическая пауза при неактивном окне
    function handleVisibilityChange() {
      if (document.hidden) {
        // Можно добавить паузу при необходимости
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Запуск при готовности приложения
    if (window.appready) {
      setTimeout(startBlizzard, 1000);
    } else {
      Lampa.Listener.follow("app", function (event) {
        if (event.type == "ready") {
          setTimeout(startBlizzard, 1000);
        }
      });
    }

    // Глобальный контроллер для ручного управления
    window.Blizzard = {
      start: startBlizzard,
      stop: stopBlizzard
    };

  })();

})();
