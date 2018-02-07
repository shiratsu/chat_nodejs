// WebSocketサーバに接続
var ws = new WebSocket('ws://localhost:8888/');
 
// エラー処理
ws.onerror = function(e){
  $('#chat-area').empty()
    .addClass('alert alert-error')
    .append('<button type="button" class="close" data-dismiss="alert">×</button>',
      $('<i/>').addClass('icon-warning-sign'),
      'サーバに接続できませんでした。'
    );
}
 
// ユーザ名をランダムに生成
var userName = 'ゲスト' + Math.floor(Math.random() * 100);
// チャットボックスの前にユーザ名を表示
$('#user-name').append(userName);
 
// WebSocketサーバ接続イベント
ws.onopen = function() {
  $('#m').focus();
  // 入室情報を文字列に変換して送信
  ws.send(JSON.stringify({
    type: 'join',
    user: userName
  }));
};
 
// メッセージ受信イベントを処理
ws.onmessage = function(event) {
  // 受信したメッセージを復元
  var data = JSON.parse(event.data);
  var item = $('<li/>').append(
    $('<div/>').append(
      $('<i/>').addClass('icon-user'),
      $('<small/>').addClass('meta chat-time').append(data.time))
  );
  console.log(data);
  // pushされたメッセージを解釈し、要素を生成する
  if (data.type === 'join') {
    item.addClass('alert alert-info')
    .prepend('<button type="button" class="close" data-dismiss="alert">×</button>')
    .children('div').children('i').after(data.user + 'が入室しました');
  } else if (data.type === 'chat') {
    item.addClass('well well-small')
    .append($('<div/>').text(data.text))
    .children('div').children('i').after(data.user);
  } else if (data.type === 'defect') {
    item.addClass('alert')
    .prepend('<button type="button" class="close" data-dismiss="alert">×</button>')
    .children('div').children('i').after(data.user + 'が退室しました');
  } else if (data.type === 'typing') {
      $('#typing').text(data.msg);
      return false;
  } else if (data.type === 'done_typing') {
      $('#typing').empty();
      return false;
  } else {
    item.addClass('alert alert-error')
    .children('div').children('i').removeClass('icon-user').addClass('icon-warning-sign')
      .after('不正なメッセージを受信しました');
  }
  $('#messages').append(item).hide().fadeIn(500);
};
 
 
// 発言イベント
$('form').submit(function(){
    var data = JSON.stringify({type:'chat',user:userName,text:$('#m').val()});
    ws.send(data);
    $('#m').val('');
    return false;
});


$("#m").focus(function(){
    console.log("forcus");
    ws.send(JSON.stringify({
      type: 'typing',
      user: userName,
    }));
}).blur(function(){
    console.log("blur");
    ws.send(JSON.stringify({
      type: 'done_typing',
      user: userName,
    }));
});

 
// ブラウザ終了イベント
window.onbeforeunload = function () {
  ws.send(JSON.stringify({
    type: 'defect',
    user: userName,
  }));
};
