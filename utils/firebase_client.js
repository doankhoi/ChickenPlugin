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

function storeRatingDataToFirebase(ratingData) {
	var hostId = ratingData.user.id;
	if (!hostId) {
		console.error("Not found host id");
		return false;
	}
	var key = '/ratings/' + hostId;
	DATABASE.ref(key).set(ratingData);
	return true;
}