<?php

require_once __DIR__.'/../vendor/autoload.php';

use Plume\WebSocket\Application;

$app = new Application();
$app['plume.root.path'] = __DIR__.'/../';// 指定根路径
$app['plume.log.debug']=true;// 开启debug日志
$app->run();