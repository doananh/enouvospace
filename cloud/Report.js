var _ = require('underscore');
var moment = require('moment');
var ReportUtil = require('./models/reportModel');

Parse.Cloud.define("getStatisticReview", function(req, res) {
    // Parse.Cloud.useMasterKey();
    var review = req.params;
    if (!review.type) return;
    var timeRange = ReportUtil.getStart_EndDay(review);
    ReportUtil.getReviews(review, timeRange).then(function(reviewsData, pointSettingsData, businessData) {

      var reviewCounts  = ReportUtil.getReviewCounts(reviewsData);
      var reasonCounts  = ReportUtil.getReasonCounts(reviewsData);
      var reasonItems   = ReportUtil.getReasonSummarys(businessData.get('availableReasons'), reasonCounts);
      var reviewItems   = ReportUtil.getReviewSummarys(pointSettingsData, reviewCounts);
      var result = {
        businessId: review.businessId,
        startDate: moment(timeRange.startDateTime).format("DD/MM/YYYY"),
        endDate: moment(timeRange.endDateTime).format("DD/MM/YYYY"),
        reviews: { total: reviewsData.length, items: reviewItems },
        reasons: { total: reasonItems.total, items: reasonItems }
      };
      res.success(result);

    }, function(err) {
      res.error(err);
    })
});

Parse.Cloud.define("getReviewHistories", function(req, res) {
    // Parse.Cloud.useMasterKey();
    var business = req.params;
    var businessQuery = new Parse.Query('Business');
    var reviewsQuery = new Parse.Query("Reviews");

    businessQuery.equalTo('objectId', business.businessId);
    businessQuery.first().then(function (businessData) {
      var filterParams = [[], undefined];
      if (!_.isUndefined(businessData.get('availableReasons'))) {
        businessData.get('availableReasons').forEach(function (reason) {
          filterParams.push(reason.id);
        });
      }
      reviewsQuery.equalTo("business", { "__type": "Pointer", "className": "Business", "objectId": business.businessId });
      reviewsQuery.containedIn("reasonReports", filterParams);
      reviewsQuery.descending("createdAt");
      reviewsQuery.find({useMasterKey: true}).then(function (reviewsData) {
      res.success(reviewsData);
      }, function (err) {
      res.error(err);
      });
    }, function (err) {
      res.error(err);
  });
});

Parse.Cloud.define("getStatisticReviewsByPeriod", function(req, res) {
    // Parse.Cloud.useMasterKey();
    var review = req.params;
    var timeRange = ReportUtil.getCustomTimeRange(review);
    ReportUtil.getReviews(review, timeRange).then(function(reviewsData, pointSettingsData, businessData) {
      var result = {
                businessId: review.businessId,
                periodType: review.type,
                totalReviews: reviewsData.length,
                startDate: moment(timeRange.startDateTime).toString(),
                endDate: moment(timeRange.endDateTime).toString(),
                reviews: ReportUtil.getReviewsForEachPeriod(timeRange, ReportUtil.convertReportPeriod(review.type), reviewsData, pointSettingsData),
              };
        res.success(result);
    }, function(err) {
      res.error(err);
    });
});
