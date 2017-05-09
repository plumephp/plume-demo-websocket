<?php

namespace Example;

use Plume\WebSocket\Core\Event;

/**
 * WebSocket服务使用示例
 * 1.约定所有数据格式都基于array,传输格式都基于json
 */
class Index extends Event{

	public function index($data){
        $ret = array('event' => 're_bind', 'code' => 0, 'data' => null);
        //无效用户登录失败
        if(empty($data) || !isset($data['user_id'])){
            $ret['code'] = -1;
            $this->replay($ret);
            $this->debug('example', '无效用户登录失败');
            return;
        }
        $user_id = $data['user_id'];
        //用户不存在
        $config = $this->getConfig();
        if(empty($config['user_list'][$user_id])){
            $ret['code'] = -2;
            $this->replay($ret);
            $this->debug('example', '用户不存在');
            return;
        }
        //绑定当前用户信息
        $user_name = $config['user_list'][$user_id];
        $bind_value = array('user_name' => $user_name);
        $this->bind('example', json_encode($bind_value));
        //通知终端绑定完毕
        $ret['code'] = 0;
        $this->replay($ret);
        $this->debug('example', '绑定完毕');
        //广播所有终端，当前用户上线
        $online_data = array('event' => 'online', 'data' => array('user_name' => $user_name, 'user_id' => $user_id));
        $this->broadcast($online_data, 'example');
        $this->debug('example', '广播完毕');
	}

	public function msg($data){
        $ret = array('event' => 're_msg', 'data' => null);
        //消息格式不正确，客户端提示消息发送失败
        if(empty($data) || !isset($data['user_id']) || !isset($data['content'])){
            $ret['code'] = -1;
            $this->replay($ret);
            return;
        }
        //通知客户端消息发送成功，这里仅作数据格式校验，也可以对广播信息进行校验
        $ret['code'] = 0;
        $this->replay($ret);

        //通知所有终端发送的消息内容
        $user_id = $data['user_id'];
        $config = $this->getConfig();
        $user_name = $config['user_list'][$user_id];

        $msg_data = array('event' => 'msg', 'data' => array('user_name' => $user_name, 'user_id' => $user_id, 'content' => $data['content']));
        $this->broadcast($msg_data);
	}

    public function close(){
        $this->status();
        //通知其他在线的用户
        $bindValue = $this->getBindValue();
        $this->debug('example close bind value', $bindValue);
        if(empty($bindValue) || ($bindValue == false)){
            $this->debug('example close', 'nothing to close');
            return;
        }
        $user_name = (json_decode($bindValue, true))['user_name'];
        $this->debug('example close', $user_name.'下线了');
        $ret = array('event' => 'offline', 'data' => array('user_name' => $user_name, 'user_id' => '-1'));
        $this->broadcast($ret, 'example');
    }
}
