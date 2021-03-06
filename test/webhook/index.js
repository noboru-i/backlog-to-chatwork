var assert = require('assert');
var rewire = require('rewire');
var sinon = require('sinon');

var subject = rewire('../../actions/webhook/index.js');

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

describe('#create_message()', () => {
  var create_message = subject.__get__('create_message');
  var template_event = {
    'type': 0,
    'project': {
      'projectKey': 'KEY'
    },
    'content': {
      'key_id': 1234,
      'summary': 'message',
      'comment': {
        'content': 'content'
      }
    },
    'createdUser': {
      'name': 'user_name'
    }
  };

  it('should return creation message when type is 1.', () => {
    var event = template_event;
    event.type = 1;
    assert.equal(create_message(event), '[info][title]user_nameが「message」を追加しました。[/title]http://foo.backlog.jp/view/KEY-1234[/info]');
  });
  it('should return updation message when type is 2.', () => {
    var event = template_event;
    event.type = 2;
    assert.equal(create_message(event), '[info][title]user_nameが「message」を更新しました。[/title]http://foo.backlog.jp/view/KEY-1234\n\ncontent[/info]');
  });
  it('should return updation message when type is 3.', () => {
    var event = template_event;
    event.type = 3;
    assert.equal(create_message(event), '[info][title]user_nameが「message」を更新しました。[/title]http://foo.backlog.jp/view/KEY-1234\n\ncontent[/info]');
  });
  it('should return bulk updation message when type is 14.', () => {
    var event = template_event;
    event.type = 14;
    event.content.link = [
      event.content,
      event.content
    ];
    assert.equal(create_message(event), '[info][title]user_nameが課題をまとめて更新しました。[/title]http://foo.backlog.jp/view/KEY-1234\nhttp://foo.backlog.jp/view/KEY-1234[/info]');
  });
});

describe('#post_to_chatwork()', () => {
  var post_to_chatwork = subject.__get__('post_to_chatwork');
  var request = require('request');
  before((done) => {
    sinon
      .stub(request, 'post')
      .yields(null, {'statusCode': 200}, {"result": "ok"});
    done();
  });
  after((done) => {
    request.post.restore();
    done();
  });

  it('should callback', () => {
    post_to_chatwork("1234", "message", (error, response, body) => {
      assert.equal(body.result, "ok");
    });
  });
});

describe('#find_room_id()', () => {
  var find_room_id = subject.__get__('find_room_id');

  it('should return room_id', () => {
    assert.equal(find_room_id('TEST1'), '11111');
  });
});
