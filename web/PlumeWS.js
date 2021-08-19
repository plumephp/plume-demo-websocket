/*
 * url get ws cluster's url
 * heartbeatTime is interval time that test is not can receive ws event
 */
function PlumeWS(urls , heartbeatTime){
	var plume = this;
	this.wsListConfig = urls;
	this.plumeSocket = null;//公有属性，原生的WebSocket对象,外部可直接使用
	this.wsUrl = '';//current ws url
	this.wsList = [];//公有属性，服务器地址

	var openCb = null;//私有属性，用来接收onopen的回调
	//var messageCb = null;//私有属性，用来接收onmessage的回调
	var errorCb = null;//私有属性，用来接收onerror的回调
	var closeCb = null;//私有属性，用来接收onclose的回调

	this.timeout = 2000; //2秒一次心跳
	this.lockReconnect = false; //是否真正建立连接
	this.timeoutObj = null; //心跳心跳倒计时
	this.serverTimeoutObj = null; //心跳倒计时
	this.timeoutnum = null; //断开 重连倒计时

	this.currentWsIndex = 0;//wsList的索引
	this.eventList = {};
	this.messageCb = null; //用来接收onmessage的回调,这里为了兼容老版本的写法

	this.init = function(){
		console.log('et ws cluster......');
		plume.wsList = plume.wsListConfig.split("|");
		console.log(plume.wsList);
		plume.currentWsIndex = (Math.ceil((plume.wsList.length-1) * 10 * Math.random()) / 10).toFixed(0);
		plume.wsUrl = plume.wsList[plume.currentWsIndex];
		console.log(plume.wsUrl);
		plume.connect();
	};

	this.connect = function(){
		//第一次或者是异常断开时都重新实例化WebSocket对象
		plume.plumeSocket =  new WebSocket(plume.wsUrl);
		plume.plumeSocket.onopen = openCb;
		plume.heartbeatTest(); // 开启心跳
		plume.plumeSocket.onmessage = function(e){
			if(e && e.data){
				if(e.data == 'pingpong'){//处理心跳接收事件
					
				}else{
					var fullData = JSON.parse(e.data);
					if(plume.eventList[fullData.event]){
						plume.eventList[fullData.event](fullData);
					}else if(plume.messageCb){//兼容老版本的写法
						plume.messageCb(fullData);
					}
				}
			}
			plume.reset();  //收到服务器信息，心跳重置
		};
		plume.plumeSocket.onerror = function(e){
			plume.reconnect();
		};
		plume.plumeSocket.onclose = function(e){
			plume.reconnect();
		};
	};
	this.reset = function(){
		//重置心跳
		//清除时间
		clearTimeout(plume.timeoutObj);
		clearTimeout(plume.serverTimeoutObj);
		//重启心跳
		plume.heartbeatTest(); 
	};
	this.bindOpen = function(cb){//接收onopen的回调
		openCb = cb;
	};
	this.bindMessage = function(cb){//接收onmessage的回调
		plume.messageCb = cb;
	};
	this.bindError = function(cb){//接收onerror的回调
		errorCb = cb;
	};
	this.bindClose = function(cb){//接收onclose的回调
		closeCb = cb;
	};
	this.sendMessage = function(data){//发送消息的方法
		if(plume.plumeSocket){
			plume.plumeSocket.send(JSON.stringify(data));
		}
	};
	this.regEvent = function(eventName , eventCb){
		plume.eventList[eventName] = eventCb;
	};
	this.heartbeatTest = function(){
		//开启心跳
		plume.timeoutObj && clearTimeout(plume.timeoutObj);
		plume.serverTimeoutObj && clearTimeout(plume.serverTimeoutObj);
		plume.timeoutObj = setTimeout(function () {
		//这里发送一个心跳，后端收到后，返回一个心跳消息
		if (plume.plumeSocket.readyState == 1) {
			//如果连接正常
			var fullData = {
				url: 'plumeWSService/cluster/ping',
				data: 'ping'
			};
			plume.plumeSocket.send(JSON.stringify(fullData));
		} else {
			//否则重连
			plume.reconnect();
		}
		plume.serverTimeoutObj = setTimeout(function () {
			//超时关闭
		   plume.plumeSocket.close();
		}, plume.timeout);
		}, plume.timeout);
	};
	this.reconnect = function(){
		console.log('重连');
		if(plume.lockReconnect){ //是否真正建立连接
			return;
		}else{
			plume.lockReconnect = true;
			//没连接上会一直重连，设置延迟避免请求过多
			plume.timeoutnum && clearTimeout(plume.timeoutnum);
			plume.timeoutnum = setTimeout(function () {
				plume.init();
				plume.lockReconnect = false;
			},5000)
		}
	}
}