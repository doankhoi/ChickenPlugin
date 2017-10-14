var CONFIG_FIREBASE = {
  apiKey: "AIzaSyDZ5HmDyPbCB1tEPn5ALrR-fni2vTsF4fs",
  authDomain: "chickencape-ef88a.firebaseapp.com",
  databaseURL: "https://chickencape-ef88a.firebaseio.com",
  projectId: "chickencape-ef88a",
  storageBucket: "",
  messagingSenderId: "789773659980"
};

firebase.initializeApp(CONFIG_FIREBASE);

var DATABASE = firebase.database();

function storeRatingDataToFirebase(hostId, ratingData, isFirst=true) {
	var key = '/ratings/' + hostId;
	if (isFirst) {
		if (!hostId) {
			console.error("Not found host id");
			return false;
		}
		DATABASE.ref(key).set(ratingData);
	} else {
		var reviewsData = ratingData.reviews;
		for (var reviewId in reviewsData) {
			var path = key + '/hostingInsightsData/reviewsData/' + reviewsData[reviewId].id;
			var update = {};
			update[path] = reviewsData[reviewId];
			DATABASE.ref().update(update);
		}
	}
	return true;
}