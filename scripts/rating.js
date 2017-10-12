var XPATH = {
  'total_stats': "//div[@class='_14bk9xpe']",
  'percent_stars': "//td[@class='_18j2f1c']/div[@class='_rotqmn2']",
  'next_page_review': "//button[@class='_1rp5252']"
};

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

setTimeout(function() {
  var next_button = $(document).xpath(XPATH['next_page_review'])[1];
  simulateMouse(next_button, "click");
}, 3000);

