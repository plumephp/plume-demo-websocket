<?php

namespace Simple\Tests;

require_once __DIR__.'/../../../vendor/autoload.php';

use Plume\Application;
use Plume\Test;

use Plume\Cluster;

function run(){
	// $app = new Application();
	// $app['plume.root.path'] = __DIR__.'/../../../';// 指定根路径
	// $redis = $app->provider('redis')->connect();
	// echo $redis->ping();
	// $redis->del('zbt:test');
	// echo "\n";
	// $redis->rpush('zbt:test', 'a');
	// $redis->rpush('zbt:test', 'b');
	// echo "\n";
	// var_dump($redis->lrange('zbt:test', 0, -1));


	// $ret = new \stdClass();
	// $ret->url = "abc";
	// $data = new \stdClass();
	// $data->data = 'yourdata';
	// $data->uid = 'uid';
	// $ret->data = $data;
	// $json_data = json_encode($ret);
	// var_dump($json_data);

	// $list = array();
	// foreach ($list as $key => $value) {
	// 	var_dump($key);
	// 	var_dump($value);
	// }

	// new Cluster(null,null,null);
	echo "asdfdf\n";
	echo 'aa';
}

run();