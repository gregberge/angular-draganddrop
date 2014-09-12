var expect = chai.expect;

describe('Draggable directive', function () {
  var $compile, $rootScope, scope;

  beforeEach(module('draganddrop'));

  beforeEach(inject(function ($injector) {
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    scope = $rootScope.$new();
  }));

  it('should enable drag', function () {
    var element = $compile('<div draggable></div>')(scope);
    expect(element).to.have.attr('draggable', 'true');
  });

  it('should disable drag', function () {
    var element = $compile('<div draggable="false"></div>')(scope);
    expect(element).to.have.attr('draggable', 'false');
  });

  describe('width "effect-allowed", "draggable-data" and "draggable-type" attributes', function () {
    var startDrag, dragEvent;

    beforeEach(function () {
      dragEvent = document.createEvent('CustomEvent');
      dragEvent.initCustomEvent('dragstart', true, false, false);
      dragEvent.dataTransfer = {
        setData: sinon.spy()
      };

      startDrag = function (element) {
        element[0].dispatchEvent(dragEvent);
      };
    });

    it('should set effect and data', function () {
      var tpl = '<div draggable="true" effect-allowed="link" ' +
      'draggable-data="{foo: \'bar\'}" draggable-type="image"></div>';
      var element = $compile(tpl)(scope);

      startDrag(element);

      expect(dragEvent.dataTransfer.effectAllowed).to.equal('link');
      expect(dragEvent.dataTransfer.setData).to.be.calledWith('json/image', '{"foo":"bar"}');
    });

    it('should prevent bubbling', function() {
        var tpl = '<div draggable draggable-data="{foo: \'bar\'}" draggable-type="image">'+
        '<div class="sub" draggable draggable-data="{toto: \'toto\'}" draggable-type="toto"></div>'+
        '</div>';
        var element = $compile(tpl)(scope);

        // Bubbling can only be test on firefox, due to a chrome bug where customEvent don't bubble
        startDrag(element.find('.sub'));

        expect(dragEvent.dataTransfer.setData).to.have.been.calledOnce;
    });
  });
});
