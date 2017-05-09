$(function() {
	  var chatRoom = new ChatRoom();
	  chatRoom.init();
});

function ChatRoom(){
	this.userId = 0;
	this.socket = {};
	var self = this;

	this.init = function(){
		//获取当前用户ID
		var userId = self.getQueryString('id');
		self.userId = userId ? userId : -1;
		//连接socket
		self.socket = new PlumeWS(url_wslist);
		//绑定socket事件
		self.socket.bindOpen(self.onOpen);
		self.socket.bindClose(self.onClose);
		self.socket.bindError(self.onError);
		self.regAllEvent();//onMessage
		self.socket.init();
  },

	this.onOpen = function(event){
		console.log("ws open ...");
		var fullData = {url:'example/index/index', data:{user_id:self.userId}};
		//发送登录信息
		self.socket.sendMessage(fullData);
	},

	//onmessage event
	this.regAllEvent = function(){
		//上线事件
		self.socket.regEvent('online' , function(fullData){
      console.log(fullData);
			var data = fullData.data;
			var old = $('#msgArea').val();
			var content = data.user_name + '上线啦！';
			$('#msgArea').val(old + content + '\r\n');
		});
		//绑定用户登录事件
		  self.socket.regEvent('re_bind' , function(fullData){
          console.log(fullData);
			if(fullData.code === 0){
				//登录成功后发送消息按钮添加click事件
				$('#send-btn').unbind("click");
				$('#send-btn').click(function(){
					var fullData = {url:'example/index/msg',event:'send_msg',data:{content:$('#msg').val(),user_id:self.userId}};
					self.socket.sendMessage(fullData);
				});
			}else if(fullData.code === -2) {
				alert('没有该用户');
			}else{
				alert('登录失败');
			}
		});
		self.socket.regEvent('re_msg' , function(fullData){
			if(fullData.code !== 0){
				alert('消息发送失败');
			}
		});
		self.socket.regEvent('msg' , function(fullData){
			var data = fullData.data;
			var old = $('#msgArea').val();
			var content = data.user_name + '：' + data.content + '。';
			$('#msgArea').val(old + content + '\r\n');
		});
		self.socket.regEvent('offline' , function(fullData){
        console.log(fullData);
			var data = fullData.data;
			var old = $('#msgArea').val();
			var content = data.user_name + '下线啦！';
			$('#msgArea').val(old + content + '\r\n');
		});
	};

	this.onClose = function(event){
		console.log("ws closed.");
	},

	this.onError = function(event){
		console.log("ws error.");
	},

	this.getQueryString = function (name) {//获取url参数
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]); return null;
	};
}
