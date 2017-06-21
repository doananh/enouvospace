var _ = require('lodash');

Parse.Cloud.afterSave("Venue", function(request, response) {
	var original = request.original;
	var requestToJSON = request.object.toJSON();
	if (requestToJSON && !requestToJSON.order) {
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
	if (original && (original.get("displayName") !== requestToJSON.displayName || original.get("peopleNumbers") !== requestToJSON.peopleNumbers)) {
		var query = new Parse.Query("Package");
      	query.equalTo("venue.objectId", requestToJSON.objectId);
        query.find().then(function(listPackage) {
	        if (listPackage && listPackage.length) {
	        	_.forEach(listPackage, function(package) {
	        		package.set("venue", {
	        			displayName: requestToJSON.displayName,
	        			peopleNumbers: requestToJSON.peopleNumbers,
	        			objectId: requestToJSON.objectId
	        		});
	        		package.save(null);
	        	})
	        } else {
	          throw('No package data found');
	        }
        })
        .catch(function(error) {
        	console.log(error);
        });
	}
});
