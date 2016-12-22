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
			type : 'get',
			datta : {},
			dataType : 'json',
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
		options.type = (options.type || "GET").toUpperCase();
		options.dataType = options.dataType || "json";
		var params = self.formatParams(options.data);

		//创建 - 非IE6 - 第一步
		if (window.XMLHttpRequest) {
			var xhr = new XMLHttpRequest();
		} else { //IE6及其以下版本浏览器
			var xhr = new ActiveXObject('Microsoft.XMLHTTP');
		}

		//接收 - 第三步
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				var status = xhr.status;
				if (status >= 200 && status < 300) {
					options.success && options.success(xhr.responseText, xhr.responseXML);
				} else {
					options.error && options.error(status);
				}
			}
		}

		//连接 和 发送 - 第二步
		if (options.type == "GET") {
			console.log(options.url + "?" + params);
			xhr.open("GET", options.url + "?" + params, true);
			xhr.send(null);
		} else if (options.type == "POST") {
			xhr.open("POST", options.url, true);
			//设置表单提交时的内容类型
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(params);
		}
	}
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