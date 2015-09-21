var assert = require("assert");
var rewire = require('rewire');

var subject = rewire('../../actions/webhook/index.js');

subject.__set__('BACKLOG_URL', 'http://foo.backlog.jp/');

describe('#create_link()', () => {
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

describe('#create_links()', () => {
  var create_links = subject.__get__('create_links');

  it('should return empty when link is empty.', () => {
    var event_obj = {"project": {"projectKey": "KEY"}};
    var link = [];
    assert.deepEqual(create_links(event_obj, link), []);
  });

  it('should return 1 link when link is 1 element.', () => {
    var event_obj = {"project": {"projectKey": "KEY"}};
    var link = [{"key_id": 1234}];
    assert.deepEqual(create_links(event_obj, link), ["http://foo.backlog.jp/view/KEY-1234"]);
  });

  it('should return 2 links when link is 2 elements.', () => {
    var event_obj = {"project": {"projectKey": "KEY"}};
    var link = [{"key_id": 1234}, {"key_id": 2345}];
    assert.deepEqual(create_links(event_obj, link), ["http://foo.backlog.jp/view/KEY-1234", "http://foo.backlog.jp/view/KEY-2345"]);
  });
});
