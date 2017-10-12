var XPATH = {
	'total_stats': "//div[@class='_14bk9xpe']",
	'percent_stars': "//main[@id='site-content']/div[@id='host-dashboard-container']//div[@class='row'][1]/div[@class='col-lg-8']//table[@class='_zdxht7']//tr[@class='_mcc0b8']/td[@class='_18j2f1c']/div[@class='_rotqmn2']",
};


function parseReview(element) {
    var publicFeedbackElement = $(element).xpath(".//span[@class='_16yk9f2m']");

    var detailRatingElements = $(element).xpath(".//div[@class='_1rlifxji']");

    $(detailRatingElements).children().each(function () {
        parseDetailRating($(this));
    })
}

function parseDetailRating(element) {
    var criteriaElement = $(element).xpath(".//div[@class='_33hj8bi']/span");
    var ratingElement = $(element).xpath(".//div[@class='_y4f73f']/span");


    if (!criteriaElement.length && !ratingElement.length) {
        console.log(criteriaElement, ratingElement);
        var criteria = $(criteriaElement[0]).text();
        var rating = parseDetailRating($(ratingElement[0]).attr('aria-label'));
        console.log('CRITERIA', criteria);
        console.log('RATING', rating);
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
    var reviewElements = $(document).xpath("//div[@class='_1f9rmq80']");
    reviewElements.each(function () {
        parseReview($(this));
    });
}

parseReviews();