var _     = require('underscore');

function convertReportPeriod(type) {
  switch (type) {
    case 'daily':
      return 'day';
    case 'weekly':
      return 'week';
    case 'monthly':
      return 'month';
    default:
      return 'day';
  }
}

function getStart_EndDay(review) {
  var now = new Date();
  var startDateTime, endDateTime;
  switch (review.type) {
    case 'daily':
      startDateTime = moment(now).startOf('day').toDate();
      endDateTime = moment(now).endOf('day').toDate();
      break;
    case 'weekly':
      startDateTime = moment(now).startOf('week').toDate();
      endDateTime = moment(now).endOf("week").toDate();
      break;
    case 'monthly':
      startDateTime = moment(now).startOf('month').toDate();
      endDateTime = moment(now).endOf("month").toDate();
      break;
    case 'custom':
      return getCustomTimeRange(review);
    default:
      startDateTime = moment(now).startOf('day').toDate();
      endDateTime = moment(now).endOf('day').toDate();
  }
  return { startDateTime: startDateTime, endDateTime: endDateTime};
}

function getCustomTimeRange(timeRange, validateTime) {
  var now = new Date();
  var _startDateTime, _endDateTime;
  _startDateTime = moment(timeRange.startDateTime).toDate();
  _endDateTime = moment(timeRange.endDateTime).toDate();
  return { startDateTime: _startDateTime, endDateTime: _endDateTime, timezoneOffset: timeRange.timezoneOffset };
}

function getReviews(review, periodOfTime) {

  var businessQuery = new Parse.Query('Business');
  var pointsQuery = new Parse.Query('PointSetting');
  var reviewsQuery = new Parse.Query("Reviews");
  var promise = new Parse.Promise();

  businessQuery.equalTo('objectId', review.businessId);
  businessQuery.include('availableReasons');
  pointsQuery.descending("points");
  Parse.Promise.when(pointsQuery.find(), businessQuery.first()).then(function (pointSettingsData, businessData) {
    reviewsQuery.equalTo("business", { "__type": "Pointer", "className": "Business", "objectId": review.businessId });
    reviewsQuery.greaterThanOrEqualTo("createdAt", periodOfTime.startDateTime);
    reviewsQuery.lessThanOrEqualTo("createdAt", periodOfTime.endDateTime);
    reviewsQuery.ascending("createdAt");
    var filterParams = [[], undefined];
    if (!_.isUndefined(businessData.get('availableReasons'))) {
      businessData.get('availableReasons').forEach(function (reason) {
        if(!_.isUndefined(reason) && reason != null)
          filterParams.push(reason.id);
      });
    }
    reviewsQuery.containedIn("reasonReports", filterParams);
    reviewsQuery.limit(1000);
    reviewsQuery.find({useMasterKey: true}).then(function (reviewsData) {
      promise.resolve(reviewsData, pointSettingsData, businessData);
    }, function (err) {
    promise.rejected(err);
    });
  }, function (err) {
    promise.rejected(err);
  });

  return promise;
}

function getReviewCounts(reviewsData) {
    var reviewPoints = _.map(reviewsData, function(value) {
        return value.get('points');
    })
    var reviewCounts = _.countBy(reviewPoints, function(value) {
        return value;
    })

    return reviewCounts;
}

function getReasonCounts(reviewsData) {
    var allReasons = [];
    _.map(reviewsData, function(value) {
        if (!_.isUndefined(value.get('reasonReports')) && value.get('reasonReports').length > 0) allReasons.push(value.get('reasonReports'));
    });
    var reasonToArray = _.flatten(allReasons);
    var reasonCounts = _.countBy(reasonToArray, function(value) {
        return value;
    });

    return reasonCounts;
}

function getReasonSummarys(reasonsData, reasonCounts) {
    var reasonItems = [];
    var total = 0;
    _.each(reasonsData, function(value) {
      if(!_.isUndefined(value) && value != null) {
        var objectId = value.id;
        var name = value.get('name');
        total+= reasonCounts[objectId] ? reasonCounts[objectId] : 0;
        reasonItems.push({
            "objectId": objectId,
            "name": name,
            "count": reasonCounts[objectId] ? reasonCounts[objectId] : 0
        });
      }
    });

    return {total: total, reasonItems: reasonItems};
}

function getReviewSummarys(pointSettingsData, reviewCounts) {
    var reviewItems = [];
    _.each(pointSettingsData, function(value) {
        var objectId = value.id;
        var point = value.get('points');
        var name = value.get('name');
        reviewItems.push({
            "objectId": objectId,
            "name": name,
            "count": reviewCounts[point] ? reviewCounts[point] : 0
        });
    });

    return reviewItems;
}

function getReviewsForEachPeriod (timeRange, period, reviewsData, pointSettingsData) {
  var dateArray = [];
  var reviewsPerPeriod = getDefaultDataForEachPeriod(pointSettingsData);
  var timeRangePerPeriod= {};
  timeRangePerPeriod.timezoneOffset = timeRange.timezoneOffset;
  timeRangePerPeriod.startDateTime = timeRange.startDateTime;
  timeRangePerPeriod.endDateTime = moment(timeRange.startDateTime).add(1, 'days').endOf(period).add(-timeRange.timezoneOffset/60, 'hours').toDate();

  reviewsData.forEach(function(review, index) {
    var reviewCreatedAt = moment(review.get('createdAt'));
    while (reviewCreatedAt.isAfter(timeRangePerPeriod.endDateTime)) {
      dateArray.push(_.clone(getResultDataForEachPeriod(reviewsPerPeriod, timeRangePerPeriod, timeRange)));
      reviewsPerPeriod = getDefaultDataForEachPeriod(pointSettingsData);
      timeRangePerPeriod = getTimeRangePerPeriod(timeRangePerPeriod, period);
    }
      reviewsPerPeriod.total++;
      reviewsPerPeriod.items[review.get('points')] = reviewsPerPeriod.items[review.get('points')];
      reviewsPerPeriod.items[review.get('points')].count++;
  });
  dateArray.push(_.clone(getResultDataForEachPeriod(reviewsPerPeriod, timeRangePerPeriod, timeRange)));
  reviewsPerPeriod = getDefaultDataForEachPeriod(pointSettingsData);
  timeRangePerPeriod = getTimeRangePerPeriod(timeRangePerPeriod, period);

  while (moment(timeRangePerPeriod.startDateTime).isBefore(timeRange.endDateTime)) {
    dateArray.push(_.clone(getResultDataForEachPeriod(reviewsPerPeriod, timeRangePerPeriod, timeRange)));
    timeRangePerPeriod = getTimeRangePerPeriod(timeRangePerPeriod, period);
  }

  return dateArray;
}

function getTimeRangePerPeriod(timeRangePerPeriod, period) {
  var _timeRangePerPeriod = {};
  _timeRangePerPeriod.timezoneOffset = timeRangePerPeriod.timezoneOffset;
  _timeRangePerPeriod.endDateTime = moment(timeRangePerPeriod.endDateTime).add(1, period+'s').toDate();
  _timeRangePerPeriod.startDateTime = moment(_timeRangePerPeriod.endDateTime).startOf(period).add(-timeRangePerPeriod.timezoneOffset/60, 'hours').toDate();

  return _timeRangePerPeriod;
}

function getResultDataForEachPeriod(reviewsPerPeriod, timeRangePerPeriod, validateTime) {

  var  _startDateTime = moment(timeRangePerPeriod.startDateTime).isBefore(validateTime.startDateTime)?moment(validateTime.startDateTime):timeRangePerPeriod.startDateTime;
  var  _endDateTime = moment(timeRangePerPeriod.endDateTime).isAfter(validateTime.endDateTime)?moment(validateTime.endDateTime):timeRangePerPeriod.endDateTime;

  reviewsPerPeriod.timeRange = {
        startDateTime: _startDateTime.toString(),
        endDateTime: _endDateTime.toString()
      };
  var arr = [];
  Object.keys(reviewsPerPeriod.items).forEach(function(e) {
      arr.push(reviewsPerPeriod.items[e]);
  });
  reviewsPerPeriod.items = arr;

  return reviewsPerPeriod;
}

function getDefaultDataForEachPeriod(pointSettingsData) {
  var reviewsPerPeriod = {
        total: 0,
        items: {}
      };
  pointSettingsData.forEach(function(data, index) {
    reviewsPerPeriod.items[data.get('points')] = {points: data.get('points'), count: 0, name: data.get('name'), objectId: data.id};
  });
  return reviewsPerPeriod;
}

exports.getDefaultDataForEachPeriod = getDefaultDataForEachPeriod;
exports.getResultDataForEachPeriod  = getResultDataForEachPeriod;
exports.getReviewsForEachPeriod     = getReviewsForEachPeriod;
exports.getReviewSummarys           = getReviewSummarys;
exports.getReasonCounts             = getReasonCounts;
exports.getReviews                  = getReviews;
exports.getCustomTimeRange          = getCustomTimeRange;
exports.convertReportPeriod         = convertReportPeriod;
exports.getStart_EndDay             = getStart_EndDay;
