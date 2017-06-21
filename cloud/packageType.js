var _ = require('lodash');

Parse.Cloud.afterSave("PackageType", function(request, response) {
	var original = request.original;
	var objectToJSON = request.object.toJSON();
	if (original && (original.get("displayName") !== objectToJSON.displayName || original.get("peopleNumbers") !== objectToJSON.peopleNumbers)) {
		var query = new Parse.Query("Package");
      	query.equalTo("packageType.objectId", objectToJSON.objectId);
        query.find().then(function(listPackage) {
			// console.log('00000'+JSON.stringify(listPackage));
	        if (listPackage && listPackage.length) {
	        	_.forEach(listPackage, function(package) {
	        		package.set("packageType", {
	        			displayName: objectToJSON.displayName,
	        			order: objectToJSON.order,
	        			objectId: objectToJSON.objectId,
	        			name: objectToJSON.name,
	        			note: objectToJSON.note
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