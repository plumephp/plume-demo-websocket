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
		// return;
	}
	var_dump($client->getSocket()->isConnected());
	echo "\n";
	// $sendd = $client->send($data);
	$sendd = $client->send('111');
	var_dump($sendd);
	echo "\n";
	// echo $client->recv();
	// echo "\n";
	// $data = '{"url":"plume/cluster/ping","data":"ping"}';
	// echo "\n";
	// echo $client->send($data);
	// echo "\n";
	// $result = $client->recv();
	// var_dump("pingpong");
	// var_dump($result);
	// var_dump($result === "pingpong");
	// echo "\n";
	echo "\n";
	echo "\n";
}

run();

