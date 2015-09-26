var config = require('config');
var request = require('request');

// constants
var CHATWORK_API_KEY = config.chatwork.apiKey;
var ROOM_ID = config.chatwork.roomId;
var BACKLOG_URL = config.backlog.url;

function create_link(event, content) {
  var url = BACKLOG_URL + "view/" + event.project.projectKey + "-" + content.key_id;
  if (content.comment && content.comment.id) {
    url += "#comment-" + content.comment.id;
  }
  return url;
}

function create_links(event, link) {
  var urls = [];
  link.forEach(function(content) {
    urls.push(create_link(event, content));
  });
  return urls;
}

function create_message(event) {
  switch(event.type) {
    case 1:
      return "[info][title]" + event.createdUser.name + "が「" + event.content.summary + "」を追加しました。[/title]" + create_link(event, event.content) + "[/info]";
    case 2:
    case 3:
      return "[info][title]" + event.createdUser.name + "が「" + event.content.summary + "」を更新しました。[/title]" + create_link(event, event.content) + "\n\n" + event.content.comment.content + "[/info]";
    case 14:
      return "[info][title]" + event.createdUser.name + "が課題をまとめて更新しました。[/title]" + create_links(event, event.content.link).join("\n") + "[/info]";
  }
  return "unknown event type: " + event.type;
}

function post_to_chatwork(room_id, message, callback) {
  var url = 'https://api.chatwork.com/v1';

  var options = {
    url: url + "/rooms/" + room_id + "/messages",
    headers : {
      'X-ChatWorkToken': CHATWORK_API_KEY
    },
    form: {
      'body': message
    }
  };
  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
    callback(error, response, body);
  });
}

function find_room_id(project_key) {
  var room_id = null;
  config.mapping.forEach(function(element) {
    if (project_key == element.project_key) {
      room_id = element.room_id;
    }
  });
  return room_id;
}

exports.handler = function(event, context) {
  console.log('start event');
  var message = create_message(event.requestParameters);
  console.log('send message: ' + message);

  var room_id = find_room_id(event.project.projectKey);

  post_to_chatwork(room_id, message, function(error, response, body) {
    console.log('response body: ' + body);

    console.log('end event');
    context.done(null, 'ok');
  });
};
