var assert = require("assert");
var rewire = require('rewire');

var module = rewire('../../actions/webhook/index.js');

module.__set__('BACKLOG_URL', 'http://foo.backlog.jp/');

describe('#create_link()', function() {
  var create_link = module.__get__('create_link');
  it('should return issue link when comment element not exists.', function () {
    var event_obj = {"project": {"projectKey": "KEY"}};
    var content = {"key_id": "1234"};
    assert.equal(create_link(event_obj, content), "http://foo.backlog.jp/view/KEY-1234");
  });
});
