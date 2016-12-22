<?php

namespace Example;

use Plume\WebSocket\Core\Event;

class Index extends Event{

	public function index($data){
        $data = json_decode($data)->data;
        $ret = new \stdClass();
        $ret->event = 're_bind';
        $ret->code = 0;
        $ret->data = null;
        //无效用户-登录失败
        if(empty($data) || !isset($data->user_id)){//para error
            $ret->code = -1;
            $this->replay($ret);
            return;
        }
        $user_id = $data->user_id;
        //用户不存在
        $config = $this->getConfig();
        if(empty($config['user_list'][$user_id])){
            $ret->code = -2;
            $this->replay($ret);
            return;
        }
        //绑定当前用户信息
        $user_name = $config['user_list'][$user_id];
        $bind_value = new \stdClass();
        $bind_value->user_name = $user_name;
        $this->bind(json_encode($bind_value));
        //通知终端绑定完毕
        $ret->code = 0;
        $this->replay($ret);
        //广播所有终端，当前用户上线
        $online_data = new \stdClass();
        $online_data->event = 'online';
        $online_data->data = new \stdClass();
        $online_data->data->user_name = $user_name;
        $online_data->data->user_id = $user_id ;
        $this->broadcast($online_data);
	}

	public function msg($data){
        $data = json_decode($data)->data;
        $ret = new \stdClass();
        $ret->data = null;
        $ret->event = 're_msg';
        //消息格式不正确，客户端提示消息发送失败
        if(empty($data) || !isset($data->user_id) || !isset($data->content)){//para error
            $ret->code = -1;
            $this->replay($ret);
            return;
        }
        //通知客户端消息发送成功，这里仅作数据格式校验，也可以对广播信息进行校验
        $ret->code = 0;
        $this->replay($ret);

        //通知所有终端发送的消息内容
        $user_id = $data->user_id;
        $config = $this->getConfig();
        $user_name = $config['user_list'][$user_id];

        $msg_data = new \stdClass();
        $msg_data->event = 'msg';
        $msg_data->data = new \stdClass();
        $msg_data->data->user_name = $user_name;
        $msg_data->data->user_id = $user_id ;
        $msg_data->data->content = $data->content ;
        $this->broadcast($msg_data);
	}

    public function close(){
        //通知其他在线的用户
        $bindValue = $this->getBindValue();
        // //slave socket
        // if(empty($bindValue)){
        //     return;
        // }
        $user_name = json_decode($bindValue)->user_name;
        $ret = new \stdClass();
        $ret->event = 'offline';
        $ret->data = new \stdClass();
        $ret->data->user_name = $user_name;
        $ret->data->user_id = '-1' ;
        $this->broadcast($ret);
    }
}