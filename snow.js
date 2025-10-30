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

  // Улучшенная система снега с дополнительными эффектами
  (function ($) {
    $.snowfall = function (container, options) {
      // Конфигурация по умолчанию
      var defaults = {
        flakeCount: 45,
        flakeColor: "#ffffff",
        flakePosition: "fixed",
        flakeIndex: 999999,
        minSize: 2,
        maxSize: 6,
        minSpeed: 1,
        maxSpeed: 4,
        round: true,
        shadow: true,
        collection: false,
        collectionHeight: 40,
        deviceorientation: true,
        wind: true,
        swing: true,
        opacity: true,
        interactive: false,
        // Новые параметры
        gradient: false,
        twinkle: false,
        accumulation: false,
        meltEffect: true
      };

      var config = $.extend({}, defaults, options);
      var flakes = [];
      var animationId = 0;
      var wind = 0;
      var accumulationData = {};
      var isPaused = false;

      // Функция для создания снежинки
      function Snowflake(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.step = 0;
        this.stepSize = random(1, 10) / 100;
        this.swingOffset = random(0, Math.PI * 2);
        this.swingSpeed = random(1, 3) / 100;
        this.opacity = config.opacity ? random(5, 10) / 10 : 1;
        this.twinkleOffset = random(0, 100);
        this.twinkleSpeed = random(1, 3) / 100;
        
        if (config.gradient) {
          this.gradientStep = random(0, 100);
          this.gradientSpeed = random(1, 5) / 100;
        }

        // Создание DOM элемента
        this.element = document.createElement("div");
        this.element.className = "snowfall-flake";
        
        var styles = {
          width: this.size + "px",
          height: this.size + "px",
          position: config.flakePosition,
          top: this.y + "px",
          left: this.x + "px",
          borderRadius: config.round ? "50%" : "0",
          backgroundColor: config.flakeColor,
          opacity: this.opacity,
          zIndex: config.flakeIndex,
          pointerEvents: "none",
          userSelect: "none",
          transition: "opacity 0.3s ease"
        };

        if (config.shadow) {
          styles.boxShadow = "1px 1px 3px rgba(0,0,0,0.3)";
        }

        if (config.gradient) {
          styles.background = `radial-gradient(circle at 30% 30%, 
                            rgba(255,255,255,${this.opacity}), 
                            rgba(200,200,255,${this.opacity * 0.3}))`;
        }

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

          this.y += this.speed;
          this.step += this.stepSize;

          // Ветер
          if (config.wind) {
            this.x += wind + Math.cos(this.step) * 0.5;
          } else {
            this.x += Math.cos(this.step) * 0.3;
          }

          // Качание
          if (config.swing) {
            this.x += Math.sin(this.step + this.swingOffset) * this.swingSpeed;
          }

          // Мерцание
          if (config.twinkle) {
            var twinkle = Math.sin(this.twinkleOffset + this.step * this.twinkleSpeed);
            this.element.style.opacity = (this.opacity * (0.7 + twinkle * 0.3)).toFixed(2);
          }

          // Градиентная анимация
          if (config.gradient) {
            this.gradientStep += this.gradientSpeed;
            var gradientPos = Math.sin(this.gradientStep) * 20 + 30;
            this.element.style.background = `radial-gradient(circle at ${gradientPos}% ${gradientPos}%, 
                                            rgba(255,255,255,${this.opacity}), 
                                            rgba(200,200,255,${this.opacity * 0.3}))`;
          }

          // Проверка границ
          var containerWidth = $(container).width();
          var containerHeight = $(container).height();
          var margin = 25;

          if (this.y > containerHeight - (this.size + 6)) {
            if (config.accumulation && config.meltEffect) {
              this.melt();
            } else {
              this.reset();
            }
          }

          if (this.x + this.size > containerWidth - margin || this.x < margin) {
            this.reset();
          }

          // Обновление позиции
          this.element.style.top = this.y + "px";
          this.element.style.left = this.x + "px";

          // Интерактивность
          if (config.interactive) {
            this.checkInteraction();
          }
        };

        // Эффект таяния
        this.melt = function() {
          var meltInterval = setInterval(() => {
            this.opacity -= 0.05;
            this.element.style.opacity = this.opacity;
            
            if (this.opacity <= 0) {
              clearInterval(meltInterval);
              this.reset();
            }
          }, 100);
        };

        // Проверка взаимодействия (для будущего расширения)
        this.checkInteraction = function() {
          // Можно добавить взаимодействие с курсором
        };

        // Сброс снежинки
        this.reset = function() {
          this.y = -this.size;
          this.x = random(margin, $(container).width() - margin);
          this.stepSize = random(1, 10) / 100;
          this.size = random(config.minSize * 100, config.maxSize * 100) / 100;
          this.speed = random(config.minSpeed, config.maxSpeed);
          this.opacity = config.opacity ? random(5, 10) / 10 : 1;
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

      function getContainerDimensions() {
        return {
          width: $(container).width(),
          height: $(container).height()
        };
      }

      var margin = $(container).get(0).tagName === $(document).get(0).tagName ? 25 : 0;

      // Основной цикл анимации
      function animate() {
        for (var i = 0; i < flakes.length; i++) {
          flakes[i].update();
        }
        
        if (!isPaused) {
          animationId = requestAnimationFrame(animate);
        }
      }

      // Инициализация снегопада
      function init() {
        var dims = getContainerDimensions();
        
        // Создание снежинок
        for (var i = 0; i < config.flakeCount; i++) {
          flakes.push(new Snowflake(
            random(margin, dims.width - margin),
            random(-100, dims.height),
            random(config.minSize * 100, config.maxSize * 100) / 100,
            random(config.minSpeed, config.maxSpeed)
          ));
        }

        // Обработчик изменения размера окна
        $(window).on("resize.snowfall", function() {
          var newDims = getContainerDimensions();
          // Можно добавить адаптацию к изменению размера
        });

        // Обработчик ориентации устройства для ветра
        if (config.deviceorientation && window.DeviceOrientationEvent) {
          $(window).on("deviceorientation.snowfall", function(event) {
            wind = (event.originalEvent.gamma || 0) * 0.1;
          });
        }

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
        accumulationData = {};
      };

      this.pause = function() {
        isPaused = true;
      };

      this.resume = function() {
        if (isPaused) {
          isPaused = false;
          animate();
        }
      };

      this.updateConfig = function(newOptions) {
        config = $.extend({}, config, newOptions);
        // Можно добавить логику обновления на лету
      };

      this.getFlakeCount = function() {
        return flakes.length;
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

  // Улучшенная система управления снегом через настройки
  (function () {
    'use strict';

    var snowInstance = null;
    var isEnabled = false;

    function initializeSnow() {
      // Расширенные настройки снега
      Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
          name: "Snow",
          type: "trigger",
          default: false
        },
        field: {
          name: "❄️ Анимированный снегопад"
        },
        onChange: function (value) {
          Lampa.Storage.set("Snow", value);
          if (value) {
            enableSnow();
          } else {
            disableSnow();
          }
        },
        onRender: function (element) {
          setTimeout(function () {
            $("div[data-name=\"Snow\"]").insertAfter("div[data-name=\"black_style\"]");
            
            // Добавляем информацию о плагине
            var infoHtml = `
              <div style="font-size:0.9em; color:#888; margin-top:5px;">
                Улучшенная система снегопада с эффектами
              </div>
            `;
            $(element).find('.settings-param__value').after(infoHtml);
          }, 0);
        }
      });

      // Дополнительные настройки снега
      Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
          name: "Snow_Intensity",
          type: "select",
          values: {
            "low": "Слабый",
            "medium": "Средний", 
            "high": "Сильный",
            "extreme": "Метель"
          },
          default: "medium"
        },
        field: {
          name: "Интенсивность снегопада",
          description: "Количество и скорость снежинок"
        },
        onChange: function (value) {
          Lampa.Storage.set("Snow_Intensity", value);
          updateSnowConfig();
        }
      });

      Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
          name: "Snow_Effects",
          type: "trigger", 
          default: true
        },
        field: {
          name: "Дополнительные эффекты",
          description: "Мерцание, ветер, таяние"
        },
        onChange: function (value) {
          Lampa.Storage.set("Snow_Effects", value);
          updateSnowConfig();
        }
      });

      // Проверка начального состояния
      if (Lampa.Storage.field("Snow")) {
        setTimeout(enableSnow, 1000);
      }
    }

    function enableSnow() {
      if (isEnabled) return;
      
      isEnabled = true;
      var intensity = Lampa.Storage.field("Snow_Intensity") || "medium";
      var effectsEnabled = Lampa.Storage.field("Snow_Effects") !== false;

      var config = {
        deviceorientation: true,
        round: true,
        shadow: true,
        wind: effectsEnabled,
        swing: effectsEnabled,
        opacity: effectsEnabled,
        twinkle: effectsEnabled,
        gradient: effectsEnabled,
        meltEffect: effectsEnabled,
        interactive: false
      };

      // Настройка интенсивности
      switch (intensity) {
        case "low":
          config.flakeCount = 25;
          config.minSize = 2;
          config.maxSize = 4;
          config.minSpeed = 1;
          config.maxSpeed = 2;
          break;
        case "medium":
          config.flakeCount = 45;
          config.minSize = 2;
          config.maxSize = 5;
          config.minSpeed = 1;
          config.maxSpeed = 3;
          break;
        case "high":
          config.flakeCount = 65;
          config.minSize = 3;
          config.maxSize = 6;
          config.minSpeed = 2;
          config.maxSpeed = 4;
          break;
        case "extreme":
          config.flakeCount = 85;
          config.minSize = 3;
          config.maxSize = 7;
          config.minSpeed = 2;
          config.maxSpeed = 5;
          break;
      }

      try {
        $(".background").snowfall(config);
        snowInstance = $(".background").data("snowfall");
        
        Lampa.Noty.show("❄️ Снегопад активирован");
      } catch (error) {
        console.error("Snowfall initialization error:", error);
        Lampa.Noty.show("Ошибка инициализации снегопада");
      }
    }

    function disableSnow() {
      if (!isEnabled) return;
      
      isEnabled = false;
      try {
        $(".background").snowfall("clear");
        snowInstance = null;
        
        Lampa.Noty.show("Снегопад отключен");
      } catch (error) {
        console.error("Snowfall cleanup error:", error);
      }
    }

    function updateSnowConfig() {
      if (isEnabled) {
        disableSnow();
        setTimeout(enableSnow, 100);
      }
    }

    // Автоматическая пауза при неактивном окне
    function handleVisibilityChange() {
      if (snowInstance) {
        if (document.hidden) {
          snowInstance.pause();
        } else {
          snowInstance.resume();
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Инициализация
    if (window.appready) {
      initializeSnow();
    } else {
      Lampa.Listener.follow("app", function (event) {
        if (event.type == "ready") {
          initializeSnow();
        }
      });
    }

    // Экспорт для глобального доступа
    window.SnowfallController = {
      enable: enableSnow,
      disable: disableSnow,
      updateConfig: updateSnowConfig
    };

  })();

})();
