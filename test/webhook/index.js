var assert = require("assert");
var rewire = require('rewire');

var subject = rewire('../../actions/webhook/index.js');

subject.__set__('BACKLOG_URL', 'http://foo.backlog.jp/');

describe('#create_link()', function() {
  var create_link = subject.__get__('create_link');

  it('should return issue link when comment element not exists.', () => {
    var event_obj = {"project": {"projectKey": "KEY"}};
    var content = {"key_id": 1234};
    assert.equal(create_link(event_obj, content), "http://foo.backlog.jp/view/KEY-1234");
  });

  it('should return comment link when comment element exists.', () => {
    var event_obj = {"project": {"projectKey": "KEY"}};
    var content = {"key_id": 1234, "comment": {"id": 999}};
    assert.equal(create_link(event_obj, content), "http://foo.backlog.jp/view/KEY-1234#comment-999");
  });
});
