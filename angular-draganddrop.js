/*! Angular draganddrop v0.0.1 | (c) 2013 Greg Bergé | License MIT */

angular
.module('draganddrop', [])
.directive('draggable', draggableDirective)
.directive('drop', ['$parse', dropDirective]);

/**
 * Draggable directive.
 *
 * @example
 * <div draggable="true" effect-allowed="link" draggable-type="image" draggable-data="{foo: 'bar'}"></div>
 */

function draggableDirective() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var domElement = element[0];
      var effectAllowed = attrs.effectAllowed;
      var draggableData = attrs.draggableData;
      var draggableType = attrs.draggableType;
      var draggable = attrs.draggable === 'false' ? false : true;

      // Make element draggable or not.
      domElement.draggable = draggable;

      if (! draggable) return ;

      domElement.addEventListener('dragstart', function (e) {
        // Restrict drag effect.
        e.dataTransfer.effectAllowed = effectAllowed || e.dataTransfer.effectAllowed;

        // Eval and serialize data.
        var data = scope.$eval(draggableData);
        var jsonData =  angular.toJson(data);

        // Set drag data and drag type.
        e.dataTransfer.setData('json/' + draggableType, jsonData);
      });
    }
  };
}

/**
 * Drop directive.
 *
 * @example
 * <div drop="onDrop($data, $event)" drop-effect="link" drop-accept="'json/image'"
 * drag-over="onDragOver($event)" drag-over-class="drag-over"></div>
 *
 * - "drop" accept an Angular expression.
 * - "drop-effect" accept a string.
 * - "drop-accept" accept a string, an array, a function or a boolean.
 * - "drag-over" accept an Angular expression.
 * - "drag-over-class" accept a string.
 */

function dropDirective($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var domElement = element[0];
      var dropEffect = attrs.dropEffect;
      var dropAccept = attrs.dropAccept;
      var dragOverClass = attrs.dragOverClass;

      var dragOverHandler = $parse(attrs.dragOver);
      var dropHandler = $parse(attrs.drop);

      domElement.addEventListener('dragover', function (event) {
        // Check if type is accepted.
        if (! accepts(scope.$eval(dropAccept), event)) return true;

        if (dragOverClass) element.addClass(dragOverClass);

        // Set up drop effect to link.
        event.dataTransfer.dropEffect = dropEffect || event.dataTransfer.dropEffect;

        // Call dragOverHandler
        dragOverHandler(scope, { $event: event });

        // Prevent default to accept drag and drop.
        event.preventDefault();
      });

      domElement.addEventListener('drop', function (event) {
        var data = getData(event);

        removeDragOverClass();

        // Call dropHandler
        dropHandler(scope, { $data: data, $event: event });

        // Prevent default navigator behaviour.
        event.preventDefault();
      });

      domElement.addEventListener('dragleave', removeDragOverClass);

      /**
       * Remove the drag over class.
       */

      function removeDragOverClass() {
        element.removeClass(dragOverClass);
      }

      /**
       * Test if a type is accepted.
       *
       * @param {String|Array|Function} type
       * @param {Event} event
       * @returns {Boolean}
       */

      function accepts(type, event) {
        if (typeof type === 'boolean') return type;
        if (typeof type === 'string') return accepts([type], event);
        if (Array.isArray(type)) {
          return accepts(function (types) {
            return types.some(function (_type) {
              return type.indexOf(_type) !== -1;
            });
          }, event);
        }
        if (typeof type === 'function') return type(event.dataTransfer.types);

        return false;
      }

      /**
       * Get data from a drag event.
       *
       * @param {Event} event
       * @returns {Object}
       */

      function getData(event) {
        var types = event.dataTransfer.types;

        return types.reduce(function (collection, type) {
          // Get data.
          var data = event.dataTransfer.getData(type);

          // Get data format.
          var format = /(.*)\//.exec(type);
          format = format ? format[1] : null;

          // Parse data.
          if (format === 'json') data = JSON.parse(data);

          collection[type] = data;

          return collection;
        }, {});
      }
    }
  };
}