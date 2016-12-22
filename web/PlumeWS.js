/*
 * url get ws cluster's url
 */
function PlumeWS(url){
	var self = this;
	this.socket = null;//公有属性，原生的WebSocket对象,外部可直接使用

	var wsUrl = '';//current ws url
	var wsList = [];//公有属性，服务器地址
	var openCb = null;//私有属性，用来接收onopen的回调
	//var messageCb = null;//私有属性，用来接收onmessage的回调
	var errorCb = null;//私有属性，用来接收onerror的回调
	var closeCb = null;//私有属性，用来接收onclose的回调
	var currentWsIndex = 0;//wsList的索引
	var reTryCount = 0;//链接某个ws已重试次数
	var eventList = {};

	this.init = function(){
		console.log('et ws cluster......');
		self.ajax({
			url : url,
			data : {callback : 'success'},
			time : 10000,
			callback : 'success',
			success : function(data){
				self.wsList = JSON.parse(data);
				self.connect();
			},
			error : function(status){
				console.log('get ws cluster fail , fail status:' + status);
			}
		});
	}

	this.connect = function(){
		console.log('connecting ws......');
		if(!openCb){//要求必须绑定onopen事件
			return ;
		}
		//第一次或者是异常断开时都重新实例化WebSocket对象
		self.socket =  new WebSocket(self.wsUrl);
		self.socket.onopen = openCb;
		//self.socket.onmessage = messageCb;
		self.socket.onmessage = function(e){
			if(e && e.data){
				var fullData = JSON.parse(e.data);
				if(fullData.error){//system error
					console.log('system error.error detail:' + fullData.data);
					return;
				}
				if(eventList[fullData.event]){
					eventList[fullData.event](fullData);
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
					currentWsIndex = 0;
					self.wsUrl = wsList[0];
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
	this.ajax = function(options) {
		options = options || {};
		if (!options.url || !options.callback) {
			throw new Error("参数不合法");
		}

		//创建 script 标签并加入到页面中
		var callbackName = ('jsonp_' + Math.random()).replace(".", "");
		var oHead = document.getElementsByTagName('head')[0];
		options.data[options.callback] = callbackName;
		var params = self.formatParams(options.data);
		var oS = document.createElement('script');
		oHead.appendChild(oS);

		//创建jsonp回调函数
		window[callbackName] = function (json) {
			oHead.removeChild(oS);
			clearTimeout(oS.timer);
			window[callbackName] = null;
			options.success && options.success(json);
		};

		//发送请求
		oS.src = options.url + '?' + params;

		//超时处理
		if (options.time) {
			oS.timer = setTimeout(function () {
				window[callbackName] = null;
				oHead.removeChild(oS);
				options.error && options.error({ message: "timeout" });
			}, time);
		}
	};
	//ajax格式化参数
	this.formatParams = function(data) {
		var arr = [];
		for (var name in data) {
			arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
		}
		arr.push(("v=" + Math.random()).replace(".",""));
		return arr.join("&");
	}
}