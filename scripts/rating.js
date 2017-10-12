var XPATH = {
  'total_stats': "//div[@class='_14bk9xpe']",
  'percent_stars': "//td[@class='_18j2f1c']/div[@class='_rotqmn2']",
};

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}

var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}


function parseTotalRating() {
  var raw_total = $(document).xpath(XPATH['total_stats']);
  if (raw_total.length != 3) {
    console.error("Length of total stats not equal 3: " + raw_total.length);
    return null;
  }

  var results = {
    'overall_rating': raw_total[0].textContent || '0',
    'total_reviews': raw_total[1].textContent || '0',
    'percent_total_5_star': raw_total[2].textContent || '0%'
  };

  return results;
}

function parsePercentStars() {
  var raw_percent_stars = $(document).xpath(XPATH['percent_stars']);
  if (raw_percent_stars.length != 5) {
    console.error("Length of percent stars not equal 5: " + raw_percent_stars.length);
    return null;
  }

  var results = {};
  raw_percent_stars.each(function(index) {
    var key = 'percent_' + index + '_star';
    results[key] = $(this).textContent || '0%';
  });

  return results;
}


function simulate(element, eventName) {
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers) {
        if (eventMatchers[name].test(eventName)) { 
          eventType = name;
          break; 
        }
    }

    if (!eventType)
      throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    } else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

setTimeout(function() {
  var erns = $(document).xpath("//div[@class='_1xal37k']/a[@class='_13g6i3a1'][1]")[0];
  simulate(erns, "click");
}, 3000);

