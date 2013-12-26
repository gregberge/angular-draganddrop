var expect = chai.expect;

describe('Drop directive', function () {
  var $compile, $rootScope, scope, dragOver, dragLeave, dragOverEvent, drop, dropEvent;

  beforeEach(module('draganddrop'));

  beforeEach(inject(function ($injector) {
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    scope = $rootScope.$new();

    // "dragover" event.
    dragOverEvent = document.createEvent('CustomEvent');
    dragOverEvent.initCustomEvent('dragover', false, false, false);
    sinon.spy(dragOverEvent, 'preventDefault');
    dragOverEvent.dataTransfer = {
      dropEffect: 'none',
      types: ['json/image', 'text/uri-list']
    };

    // "drop" event.
    dropEvent = document.createEvent('CustomEvent');
    dropEvent.initCustomEvent('drop', false, false, false);
    sinon.spy(dropEvent, 'preventDefault');
    dropEvent.dataTransfer = {
      types: ['json/image', 'text/uri-list'],
      getData: function (type) {
        if (type === 'json/image') return '{"foo":"bar"}';
        if (type === 'text/uri-list') return 'http://dragdrop.com';
      }
    };

    // "dragleave" event.
    var dragLeaveEvent = document.createEvent('CustomEvent');
    dragLeaveEvent.initCustomEvent('dragleave', false, false, false);

    dragOver = function (element) {
      element[0].dispatchEvent(dragOverEvent);
    };

    dragLeave = function (element) {
      element[0].dispatchEvent(dragLeaveEvent);
    };

    drop = function (element) {
      element[0].dispatchEvent(dropEvent);
    };
  }));

  describe('"drop-effect"', function () {
    it('should set dataTransfer.dropEffect', function () {
      var tpl = '<div drop drop-accept="true" drop-effect="link"></div>';
      var element = $compile(tpl)(scope);

      dragOver(element);

      expect(dragOverEvent.dataTransfer.dropEffect).to.equal('link');
    });
  });

  describe('"drag-over"', function () {
    it('should call "drag-over" with $event', function () {
      scope.onDragOver = sinon.spy();

      var tpl = '<div drop drop-accept="true" drag-over="onDragOver($event)"></div>';
      var element = $compile(tpl)(scope);

      dragOver(element);

      expect(scope.onDragOver).to.be.calledWith(dragOverEvent);
    });
  });

  describe('"drop-accept"', function () {
    describe('string', function () {
      it('should accept type', function () {
        var tpl = '<div drop drop-accept="\'json/image\'"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.be.called;
      });

      it('should not accept type', function () {
        var tpl = '<div drop drop-accept="\'xx\'"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.not.be.called;
      });
    });

    describe('array', function () {
      it('should accept type', function () {
        var tpl = '<div drop drop-accept="[\'json/image\', \'xxx\']"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.be.called;
      });

      it('should not accept type', function () {
        var tpl = '<div drop drop-accept="[\'xx\']"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.not.be.called;
      });
    });

    describe('function', function () {
      it('should accept type', function () {
        scope.checkType = function (types) {
          expect(types).to.eql(['json/image', 'text/uri-list']);
          return true;
        };

        var tpl = '<div drop drop-accept="checkType"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.be.called;
      });

      it('should not accept type', function () {
        scope.checkType = function (types) {
          expect(types).to.eql(['json/image', 'text/uri-list']);
          return false;
        };

        var tpl = '<div drop drop-accept="checkType"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.not.be.called;
      });

      it('should be compatible with DOMStringList that are not array', function () {
        dragOverEvent.dataTransfer.types = {
          0: 'json/image',
          1: 'text/uri-list',
          length: 2
        };

        scope.checkType = function (types) {
          expect(types).to.eql(['json/image', 'text/uri-list']);
          return false;
        };

        var tpl = '<div drop drop-accept="checkType"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.not.be.called;
      });
    });

    describe('boolean', function () {
      it('should accept type', function () {
        var tpl = '<div drop drop-accept="true"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.be.called;
      });

      it('should not accept type', function () {
        var tpl = '<div drop drop-accept="false"></div>';
        var element = $compile(tpl)(scope);

        dragOver(element);

        expect(dragOverEvent.preventDefault).to.not.be.called;
      });
    });
  });

  describe('"drag-over-class"', function () {
    it('should add class if accepted', function () {
      var tpl = '<div drop drag-over-class="dragover" drop-accept="true"></div>';
      var element = $compile(tpl)(scope);

      dragOver(element);

      expect(element).to.have.class('dragover');
    });

    it('should remove class on drag leave', function () {
      var tpl = '<div drop drag-over-class="dragover" drop-accept="true"></div>';
      var element = $compile(tpl)(scope);

      dragOver(element);
      dragLeave(element);

      expect(element).to.not.have.class('dragover');
    });

    it('should remove class on drop', function () {
      var tpl = '<div drop drag-over-class="dragover" drop-accept="true"></div>';
      var element = $compile(tpl)(scope);

      dragOver(element);
      drop(element);

      expect(element).to.not.have.class('dragover');
    });
  });

  describe('"drop"', function () {
    it('should call "drop" with $data and $event', function () {
      scope.onDrop = sinon.spy();

      var tpl = '<div drop="onDrop($data, $event)"></div>';
      var element = $compile(tpl)(scope);

      drop(element);

      expect(scope.onDrop).to.be.calledWith({
        'json/image': {foo: 'bar'},
        'text/uri-list': 'http://dragdrop.com'
      }, dropEvent);
    });
  });
});