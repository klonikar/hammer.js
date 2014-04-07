(function(Hammer) {
  /**
   * enable multitouch on the desktop by pressing the shiftkey
   * the other touch goes in the opposite direction so the center keeps at its place
   * it's recommended to enable Hammer.debug.showTouches for this one
   */
  Hammer.plugins.fakeMultitouch = function() {
    // keeps the start position to keep it centered
    var start_pos = false;

    // test for msMaxTouchPoints to enable this for IE10 with only one pointer (a mouse in all/most cases)
    Hammer.HAS_POINTEREVENTS = navigator.msPointerEnabled &&
      navigator.msMaxTouchPoints && navigator.msMaxTouchPoints >= 1;

    /**
     * overwrites Hammer.event.getTouchList.
     * @param   {Event}     ev
     * @param   TOUCHTYPE   type
     * @return  {Array}     Touches
     */    
    Hammer.event.getTouchList = function(ev, eventType) {
      // mobile fallback
      if(ev.touches) {
        var identifiers = [];
        var concat_touches = [].concat(Utils.toArray(ev.touches), Utils.toArray(ev.changedTouches));
        var touchlist = [];
        
        Utils.each(concat_touches, function(touch) {
          if(!Utils.inArray(identifiers, touch.identifier)) {
            touchlist.push(touch);
          }
          identifiers.push(touch.identifier);
        });
        
        return touchlist;
      }

      // reset on start of a new touch
      if(eventType == Hammer.EVENT_START) {
        start_pos = false;
      }
      
      var touchList;

      // when the shift key is pressed, multitouch is possible on desktop
      // why shift? because ctrl and alt are taken by osx and linux
      if(ev.shiftKey) {
        // on touchstart we store the position of the mouse for multitouch
        if(!start_pos) {
          start_pos = {
            pageX: ev.pageX,
            pageY: ev.pageY,
            clientX: ev.clientX,
            clientY: ev.clientY
          };
        }

        var distance_x = start_pos.pageX - ev.pageX;
        var distance_y = start_pos.pageY - ev.pageY;

        // fake second touch in the opposite direction
        touchList = [
          {
            identifier: 1,
            pageX     : start_pos.pageX - distance_x - 50,
            pageY     : start_pos.pageY - distance_y + 50,
            clientX   : start_pos.clientX - distance_x - 50,
            clientY   : start_pos.clientY - distance_y + 50,
            target    : ev.target
          },
          {
            identifier: 2,
            pageX     : start_pos.pageX + distance_x + 50,
            pageY     : start_pos.pageY + distance_y - 50,
            clientX   : start_pos.clientX + distance_x + 50,
            clientY   : start_pos.clientY + distance_y - 50,
            target    : ev.target
          }
        ];
      }
      // normal single touch
      else {
        start_pos = false;
        touchList = [
          {
            identifier: 1,
            pageX     : ev.pageX,
            pageY     : ev.pageY,
            clientX   : ev.clientX,
            clientY   : ev.clientY,
            target    : ev.target
          }
        ];
      }
      
      ev.touches = touchList;
      ev.changedTouches = touchList;
      return touchList;
    };
  };

})(window.Hammer);