var XPATH = {
	'total_stats': "//div[@class='_14bk9xpe']",
	'percent_stars': "//main[@id='site-content']/div[@id='host-dashboard-container']//div[@class='row'][1]/div[@class='col-lg-8']//table[@class='_zdxht7']//tr[@class='_mcc0b8']/td[@class='_18j2f1c']/div[@class='_rotqmn2']",
};

$(function() {
	console.log($(document).xpath(XPATH['total_stats']));
});
