var XPATH = {
  'total_stats': "//div[@class='_14bk9xpe']",
  'percent_stars': "//td[@class='_18j2f1c']/div[@class='_rotqmn2']",
  'next_page_review': "//button[@class='_1rp5252']",
  'wraper_reviews': "//div[@class='_1f9rmq80']",
  'number_of_page': "//th/div[@class='_m2kx622']/span",
  'listing_ids': "//select[@id='listingSelector']/option"
};

function parseReview(element) {
    var results = {};
    var boxHeaderReviews = $(element).xpath(".//div[@class='_atbpe5']");
    var publicFeedBack = $(element).xpath(".//span[@class='_16yk9f2m']");
    var publicResponse = $(element).xpath(".//div[@class='_rotqmn2']");
    var boxWrapDetailStars = $(element).xpath(".//div[@class='_1rlifxji']");

    boxHeaderReviewsResults = parseBoxHeaderReviews(boxHeaderReviews);
    publicFeedBack = $(publicFeedBack).text();
    publicResponse = $(publicResponse).text();
    results = extend(results, boxHeaderReviewsResults);

    var detailsRating = parseBoxWrapDetailStars(boxWrapDetailStars);

    results = extend(results, {
        'public_feedback': publicFeedBack,
        'public_response': publicResponse
    });

    return extend(results, detailsRating);
}


function parseBoxWrapDetailStars(parseBoxWrapDetailStars) {
    var listItems = $(parseBoxWrapDetailStars).xpath("./div");
    if ((listItems.length != 6) && (listItems.length != 7)) {
        console.error("Xpath of parseBoxWrapDetailStars wrong");
        alert("Xpath of parseBoxWrapDetailStars wrong");
        return;
    }

    if (listItems.length == 7) {
        listItems = listItems.slice(1, 7);
    }

    var results = {};
    listItems.each(function(index) {
        var keyEl = $(this).xpath(".//div[@class='_33hj8bi']");
        var valEl = $(this).xpath(".//div[@class='_y4f73f']/span");
        results[$(keyEl).text().toLowerCase()] = parseRatingValue($(valEl).attr('aria-label'));
    });
    return results;
}

function parseBoxHeaderReviews(boxHeaderReviews) {
    var guestNameElement = $(boxHeaderReviews).xpath(".//div[@class='_33hj8bi']");
    var propertyNameElement = $(boxHeaderReviews).xpath(".//div[@class='_150a3jym'][2]");
    var ratingElement = $(boxHeaderReviews).xpath(".//span");
    return {
        'guest_name': $(guestNameElement).text(),
        'property': $(propertyNameElement).text(),
        'rating': parseRatingValue($(ratingElement).attr('aria-label'))
    }
}

function parseRatingValue(ratingLabel) {
    console.log('RATING LABEL', ratingLabel);
    // Rating 5 out of 5
    var result = ratingLabel.match(/(\d) out of/);
    if (result) {
        return parseInt(result[1]);
    }

    return -1;
}

function parseReviews() {
    var reviewElements = $(document).xpath(XPATH['wraper_reviews']);
    reviewElements.each(function (index) {
      console.log(parseReview($(this)));
    });
}

function parseTotalRating() {
  var rawTotal = $(document).xpath(XPATH['total_stats']);
  if (rawTotal.length != 3) {
    console.error("Length of total stats not equal 3: " + rawTotal.length);
    alert("Xpath total rating wrong!");
    return null;
  }

  var results = {
    'overall_rating': rawTotal[0].textContent || '0',
    'total_reviews': rawTotal[1].textContent || '0',
    'percent_total_5_star': rawTotal[2].textContent || '0%'
  };

  return results;
}

function parsePercentStars() {
  var rawPercentStars = $(document).xpath(XPATH['percent_stars']);
  if (rawPercentStars.length != 5) {
    console.error("Length of percent stars not equal 5: " + rawPercentStars.length);
    alert("Xpath percent stars wrong!");
    return null;
  }

  var results = {};
  rawPercentStars.each(function(index) {
    var key = 'percent_' + index + '_star';
    results[key] = $(this).textContent || '0%';
  });

  return results;
}

function nextPageReview() {
  var next_button = $(document).xpath(XPATH['next_page_review'])[1];
  simulateMouse(next_button, "click");
}

function checkEndOfPage() {
  var numberOfPageElement = $(document).xpath(XPATH['number_of_page']);
  var textContent = $(numberOfPageElement).text();
  console.log("Number of page : " + textContent);

  if (textContent) {
    var matchs = textContent.match(/(\d+) of (\d+)/);
    if (matchs) {
      return parseInt(matchs[1]) == parseInt(matchs[2]);
    }
  }

  console.error("Xpath number of page wrong");
  return true;
}

function getAllListingIds() {
  var optionListings = $(document).xpath(XPATH['listing_ids']);
  var listing_ids = [];

  if (!optionListings) {
    return [];
  }
  optionListings.each(function(index) {
    try {
      listing_id = parseInt($(this).val());
      if (!isNaN(listing_id)) {
        listing_ids.push(listing_id);
      }
    } catch (e) {}
  });
  return listing_ids;
}

function getAllDataCurrentPage() {
  var scriptData = $(document).xpath("//script[@data-hypernova-key='host_dashboard_statsbundlejs']");
  var rawData = $(scriptData).text();
  rawData = rawData.substring(4, rawData.length - 3);
  try {
    var data = JSON.parse(rawData);
    delete data['phrases'];
    return convertReviewData(data);
  } catch (e) {
    console.error(e);
    return null;
  }
}

function getConfigCurrentPage() {
  var configMetaElement = $(document).xpath("//meta[@id='_bootstrap-layout-init']");
  var rawConfig = $(configMetaElement).attr('content');
  try {
    rawConfig = rawConfig.replace('&quot;', '"');
    return JSON.parse(rawConfig);
  } catch (e) {
    console.error("Get config page error");
    return null;
  }
}

function convertReviewData(data) {
  var reviewsData = data.hostingInsightsData.reviewsData;
  if (reviewsData) {
    var newReview = {};
    for (var review in reviewsData) {
      newReview[reviewsData[review].id] = reviewsData[review];
    }
    data.hostingInsightsData.reviewsData = newReview;
  }

  return data;
}


function getDataFromAPI(revieweeId, key, limit=4, offset=0) {
  var baseAPI = "https://www.airbnb.com/api/v2/reviews?_format=for_web_host_stats&_order=recent&role=guest&currency=USD&locale=en";
  baseAPI = baseAPI + '&reviewee_id=' + revieweeId + '&key=' + key + '&_limit=' + limit + '&_offset=' + offset;
  fetch(baseAPI, {
      method: 'GET',
      credentials: 'include'
    })
    .then(function(response) {
      return response.json();
      // storeRatingDataToFirebase(revieweeId, data, false);
    })
    .then(function(json) {
      storeRatingDataToFirebase(revieweeId, json, false);
    })
    .catch(function(err) {
      console.log(err);
    });
}

setTimeout(function() {
  var isFirst = true;
  var dataCurrentPage = getAllDataCurrentPage();
  if (!dataCurrentPage) {
    return;
  }
  var revieweeId = dataCurrentPage.user.id;

  // Save data
  storeRatingDataToFirebase(revieweeId, dataCurrentPage, true);
  
  var config = getConfigCurrentPage();

  if (!config) {
    return;
  }
  var numHostRatings = parseInt(dataCurrentPage.user.num_host_ratings);
  var key = config.api_config.key;
  var numRepeat = Math.floor(numHostRatings / 20);

  for (var i = 0; i <= numRepeat; i++) {
    getDataFromAPI(revieweeId, key, 20, i*20);
    sleep(5000);
  }

  alert('Updated data completed !');
}, 3000);


