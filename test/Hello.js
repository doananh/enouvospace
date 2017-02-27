var _ = require('underscore');

Parse.Cloud.define('hello', function(request, response) {
  response.success('Hi');
});
