var LINK_GET = "https://www.airbnb.com/stats/ratings/(\d+)";
var STOP_WORD = [
  "a", "about", "above", "after", "again", "against", "all", 
  "am", "an", "and", "any", "are", "aren't", "as", "at", "be", 
  "because", "been", "before", "being", "below", "between", "both", 
  "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", 
  "do", "does", "doesn't", "doing", "don't", "down", "during", "each", 
  "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", 
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", 
  "here", "here's", "hers", "herself", "him", "himself", "his", "how", 
  "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", 
  "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", 
  "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", 
  "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", 
  "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", 
  "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", 
  "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", 
  "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
  "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", 
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which", 
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", 
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", 
  "yourself", "yourselves"
];

/**
 * Get all data of current page
 * @return
 */
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


/**
 * Use review ID for primary key
 * @param  {Array} data Raw data
 * @return
 */
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


/**
 * Get config of current user
 * @return
 */
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


/**
 * Fetch data from api
 * @param  {[type]} revieweeId [description]
 * @param  {[type]} key        [description]
 * @param  {Number} limit      [description]
 * @param  {Number} offset     [description]
 * @return {[type]}            [description]
 */
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

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

function getAllReviewsCurrentUser() {
  var dataCurrentPage = getAllDataCurrentPage();
  if (!dataCurrentPage) {
    return {status: false, message: "Not found data current page"};
  }
  var revieweeId = dataCurrentPage.user.id;

  // Save data
  storeRatingDataToFirebase(revieweeId, dataCurrentPage, true);

  var config = getConfigCurrentPage();
  if (!config) {
    return {status: false, message: "Not found config current page"};
  }

  var numHostRatings = parseInt(dataCurrentPage.user.num_host_ratings);
  var key = config.api_config.key;
  var numRepeat = Math.floor(numHostRatings / 20);
  for (var i = 0; i <= numRepeat; i++) {
    getDataFromAPI(revieweeId, key, 20, i*20);
    // sleep(5000);
  }

  return {status: true, message: "Push data completely"};
}

function showOverlayLoading() {
  var wrapLoadingOld = $(".cohost-wrap-loading");
  if (wrapLoadingOld.length == 0) {
    var wrapLoading = document.createElement("div");
    wrapLoading.setAttribute("class", "cohost-wrap-loading");

    var loadingDiv = document.createElement("div");
    loadingDiv.setAttribute("class", "cohost-overlay-loading");

    wrapLoading.appendChild(loadingDiv);
    document.body.appendChild(wrapLoading);
  } else {
    wrapLoadingOld.css({display: "block"});
  }
}

function hiddenOverlayLoading() {
  $(".cohost-wrap-loading").css({display: "none"});
}

function showMessage(message, type, callback) {
  hiddenOverlayLoading();
  swal("Cohost Club", message, type, callback);
}

function isRatingPage() {
  var patt = /.*stats\/ratings\/?(\d+)?/g;
  var link = window.location.href;
  return patt.test(link);
}


function normalizeWord(word) {
  if (!word) return null;
  word = word.trim();
  word = word.replace(/[\(\),.!?;""]/g, '');
  return word.toLowerCase();
}

function createTagCloud(words) {
  if (words.length == 0) {
    showMessage("Not found data reviews", "error");
    return;
  }

  var wordmap = {};
  words.map(function(d) {
    var word_list = d.split(' ');
    for (var i in word_list) {
      word = word_list[i];
      word = normalizeWord(word);

      if (!word || STOP_WORD.indexOf(word) != -1 || word.length == 0) {
        continue;
      }

      if (!wordmap.hasOwnProperty(word)) {
        wordmap[word] = 0;
      }
      wordmap[word] = wordmap[word] + 1;
    }
  });

  console.log(wordmap);
  d3.layout.cloud().size([900, 600])
    .words(d3.entries(wordmap).map(function(d){
      return {text: d.key, size: d.value};
    }))
    .padding(1)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) {
      return d.size * 20;
    })
    .on("end", draw)
    .start();
}


function draw(words) {
  showTagCloud();
  var fill = d3.scale.category20();
  d3.select("#cohost-tag-cloud")
  .append("svg")
    .attr("width", 900)
    .attr("height", 600)
  .append("g")
    .attr("transform", "translate(450, 300)")
  .selectAll("text")
    .data(words)
  .enter().append("text")
    .style("font-size", function(d) { return d.size + "px"; })
    .style("font-family", "Impact")
    .style("fill", function(d, i) { return fill(i); })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
  .text(function(d) { return d.text; });
}


function showTagCloud() {
  $(".cohost-wrap-tagcloud").remove();

  var divWrapTagCloud = document.createElement("div");
  divWrapTagCloud.setAttribute("class", "cohost-wrap-tagcloud");

  var divContent = document.createElement("div");
  divContent.setAttribute("class", "cohost-tag-cloud-content");

  var divTagCloud = document.createElement("div");
  divTagCloud.setAttribute("id", "cohost-tag-cloud");

  var buttonClose = document.createElement("button");
  buttonClose.setAttribute("id", "cohost-close-tag-cloud");
  buttonClose.innerHTML = "Close";
  buttonClose.addEventListener('click', function(){
    $(".cohost-wrap-tagcloud").remove();
  });

  divContent.appendChild(divTagCloud);
  divContent.appendChild(buttonClose);

  divWrapTagCloud.appendChild(divContent);

  document.body.appendChild(divWrapTagCloud);
}


function JSONToCVSConvertor(JSONData, ReportTitle, ShowLabel) {
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    CSV += ReportTitle + '\r\n\n';

    if (ShowLabel) {
        var row = "";
        for (var index in arrData[0]) {
            row += index + ',';
        }

        row = row.slice(0, -1);
        CSV += row + '\r\n';
    }

    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "Report_";
    fileName += ReportTitle.replace(/ /g,"_");
    fileName += '_' + (new Date().toJSON());   
    
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    var link = document.createElement("a");    
    link.href = uri;
    
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);    
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}


/**
 * Flatten Json object
 * @param  {[type]} target [description]
 * @param  {[type]} opts   [description]
 * @return {[type]}        [description]
 */
function jsonFlatten(target, opts) {
  opts = opts || {};

  var delimiter = opts.delimiter || '.';
  var maxDepth = opts.maxDepth;
  var output = {};

  function step (object, prev, currentDepth) {
    currentDepth = currentDepth || 1;
    Object.keys(object).forEach(function (key) {
      var value = object[key];
      var isarray = opts.safe && Array.isArray(value);
      var type = Object.prototype.toString.call(value);
      var isbuffer = isBuffer(value);
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      );

      var newKey = prev
        ? prev + delimiter + key
        : key;

      if (!isarray && !isbuffer && isobject && Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1);
      }

      output[newKey] = value;
    });
  }

  step(target);

  return output;
}

function filterField(reviewData) {
  if (!reviewData) {
    return;
  }

  var fields = [
    'id', 'rating', 'accuracy', 'checkin', 'cleanliness', 
    'value', 'location', 'communication', 'comments', 'private_feedback',
    'reservation.check_in', 'reservation.check_out', 'reservation.confirmation_code',
    'reservation.listing.id', 'reservation.listing.name', 'reservation.rounded_per_night_price_string_host',
    'responded_at', 'response', 'reviewer.first_name', 'reviewer.host_name', 'reviewer.id',
    'reviewer.is_superhost', 'reviewer.last_name', 'reviewer.picture_url', 'reviewer.profile_path',
    'reviewer.profile_pic_path'
  ];

  var result = {};
  fields.forEach(function(key) {
    if (reviewData.hasOwnProperty(key)) {
      result[key] = reviewData[key];
    }
  });

  return result;
}

function getReviewsDataCallback(snapshot) {
  var reviewsData = [];
  snapshot.forEach(function(childSnapshot) {
    var filterData = filterField(jsonFlatten(childSnapshot.val()));
    reviewsData.push(filterData);
  });

  JSONToCVSConvertor(reviewsData, "Ratings Report", true);
}

// Register listener message
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log("Message: " + request.message);

    if (!isRatingPage()) {
        showMessage("Please open link: " + LINK_GET + " to push data", 'error');
        return;
    }

    if (request.message === "push_data") {
      showOverlayLoading();
      var results = getAllReviewsCurrentUser();

      if (results.status) {
        hiddenOverlayLoading();
        swal({
          title: "Cohost Club",
          text: results.message,
          type: "success"
        }, function(){
          createTagCloud(LIST_COMMENTS);
        });

      } else {
        showMessage(results.message, 'error');
      }
      
    } else if (request.message === "export-data") {
      var dataCurrentPage = getAllDataCurrentPage();
      if (!dataCurrentPage) {
        showMessage('Not get all current page');
        return;
      }
      var revieweeId = dataCurrentPage.user.id;
      var path = '/ratings/' + revieweeId  + '/hostingInsightsData/reviewsData';
      getDataFromFirebase(path, getReviewsDataCallback);
    }
  }
);

