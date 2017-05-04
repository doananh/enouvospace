Parse.Cloud.afterSave("Venue", function(request, response) {
	var requestToJSON = request.object.toJSON();
	if(requestToJSON && !requestToJSON.order) {
		new Promise((resolve, reject) => {
			var venueQuery = new Parse.Query("Venue");
			venueQuery.count().then((count, error) => {
				if(error) reject(error);
				return count;
			}).then((count) => {
				request.object.set("order", count);
				return request.object.save(null, { useMasterKey: true });
			}).then((venue, error) => {
				if(error) reject(error);
				resolve(venue);
			}).catch((error) => {
				reject(error);
			});
		});
	}
});
