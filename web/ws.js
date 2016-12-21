/*
 * wsUrl ws默认地址
 * wsList 备用ws列表
 */
function InfobirdWS(wsUrl , wsList){
	var self = this;
	this.wsUrl = wsUrl;//公有属性，服务器地址
	this.socket = null;//公有属性，原生的WebSocket对象,外部可直接使用

	var openCb = null;//私有属性，用来接收onopen的回调
	//var messageCb = null;//私有属性，用来接收onmessage的回调
	var errorCb = null;//私有属性，用来接收onerror的回调
	var closeCb = null;//私有属性，用来接收onclose的回调
	var currentWsIndex = -1;//-1表示链接默认ws，其余值为wsList的索引
	var reTryCount = 0;//链接某个已ws重试次数
	var eventList = [];

	this.connect = function(){
		console.log('connecting......');
		if(!openCb || !messageCb){//要求必须绑定onopen和onmessage事件
			return ;
		}
		//第一次或者是异常断开时都重新实例化WebSocket对象
		self.socket =  new WebSocket(self.wsUrl);
		self.socket.onopen = openCb;
		//self.socket.onmessage = messageCb;
		self.socket.onmessage = function(e){
			if(e && e.data){
				var fullData = JSON.parse(e.data);
				if(fullData.code = 500){//system error
					console.log('system error.');
					return;
				}
				if(eventList[e.data.event]){
					eventList[e.data.event](fullData);
				}
			}

		}
		self.socket.onerror = errorCb;
		var closeCbWrap = function(e){//执行外部绑定的onclose事件并自动重连
			if(reTryCount > 3){
				currentWsIndex++;
				if(wsList[currentWsIndex]){
					self.wsUrl = wsList[currentWsIndex];
				}else{
					currentWsIndex = -1;
					self.wsUrl = wsUrl;
				}
				reTryCount = 0;
			}
			if(closeCb){
				closeCb(e);
			}
			self.connect();//重连
			reTryCount++;
		}
		self.socket.onclose = closeCbWrap;
	}

	this.bindOpen = function(cb){//接收onopen的回调
		openCb = cb;
	}
	this.bindMessage = function(cb){//接收onmessage的回调
		messageCb = cb;
	}
	this.bindError = function(cb){//接收onerror的回调
		errorCb = cb;
	}
	this.bindClose = function(cb){//接收onclose的回调
		closeCb = cb;
	}
	this.sendMessage = function(data){//发送消息的方法
		if(self.socket){
			self.socket.send(JSON.stringify(data));
		}
	}
	this.regEvent = function(eventName , eventCb){
		eventList[eventName] = eventCb;
	}
}