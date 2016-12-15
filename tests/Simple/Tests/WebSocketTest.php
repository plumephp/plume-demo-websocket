<?php

namespace Simple\Tests;

require_once __DIR__.'/../../../vendor/autoload.php';
include_once("./WebSocketClient.php");

use Plume\Application;
use Plume\Test;

function run(){
	$data = '{"url":"plume/cluster/broadcast","data":"strdata"}';
	$reConnTimes = 5;
	$host = '127.0.0.1';
	$port = '9501';
	$client = new \WebSocketClient($host, $port);
	if (!$client->connect()) {
		echo "error";
		echo "\n";
	}
	echo $client->connect();
	echo "\n";
	echo $client->send($data);
	echo "\n";
	$data = '{"url":"plume/cluster/ping","data":"ping"}';
	echo "\n";
	echo $client->send($data);
}

run();

