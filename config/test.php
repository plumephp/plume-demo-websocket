<?php
return array(
	'redis'=>array('host' => '127.0.0.1','port'=>6379),
	'actions_close' => array(
		'example_index' => 'Example\Index',
	),
	'server' => array(
		'master' => array(
			'host' => '127.0.0.1',
			'port' => '9501',
			),
		'slaves' => array(
				array(
					'host' => 'localhost',
					'port' => '9502',
				),
				// array(
				// 	'host' => '127.0.0.1',
				// 	'port' => '9503',
				// ),
			)
		),
	'config' => array(
			'timeout' => 2.5,  //select and epoll_wait timeout.
			'poll_thread_num' => 2, //reactor thread num
			'worker_num' => 1,      //worker process num，设置启动的worker进程数量，测试时使用1个即可
			'backlog' => 128,       //listen backlog
			'max_conn' => 100,      // Server最大允许维持多少个tcp连接。超过此数量后，新进入的连接将被拒绝
			'max_request' => 0,     // worker进程在处理完n次请求后结束运行，manager会重新创建一个worker进程。设置为0表示不自动重启。若在Worker进程中需要保存连接信息的服务，需要设置为0
			// dispatch_mode 配置在BASE模式是无效的，因为BASE不存在投递任务
			// 进程数据包分配模式: 1平均分配，2按FD取摸固定分配，3抢占式分配，默认为取摸(dispatch=2),4按IP分配，5按UID分配(需要用户代码中调用$serv->bind_uid(将一个连接绑定1个uid)
			'dispatch_mode'=> 2,
			'daemonize' => false,	// 若设置为true，执行php server.php将转入后台作为守护进程运行
			'log_file' => "/Users/zhangtao/Documents/plumephp2016/plume-demo-websocket/var/logs/app.log", // daemonize为true时，输出内容才会写入到该日志文件
			//'heartbeat_idle_time' => 20,        // 连接最大允许空闲的时间(秒)，与heartbeat_check_interval配合使用.当dispatch_mode=1/3时，底层会屏蔽onConnect/onClose事件
			//'heartbeat_check_interval' => 10,   // 表示每隔多久轮循一次，单位为秒
		)
);