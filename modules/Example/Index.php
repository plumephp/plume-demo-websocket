<?php

namespace Example;

use Plume\WebSocket\Core\Event;

class Index extends Event{

	public function index($data){
        $ret = new \stdClass();
        $ret->event = 're_bind';
        $ret->code = 0;
        $ret->data = null;
        if(empty($data) || !isset($data->user_id)){//para error
            $ret->code = -1;
            $this->replay($ret);
            return;
        }
        $user_id = $data->user_id;

        $config = $this->getConfig();
        if(empty($config['user_list'][$user_id])){
            $ret->code = -2;
            $this->replay($ret);
            return;
        }
        $user_name = $config['user_list'][$user_id];
        if($user_id == -1){
            $user_name = $user_name.$this->fd;
        }
        $user_list_json = file_get_contents('user_list.txt');
        if(empty($user_list_json)){
            $user_list = array();
        }else{
            $user_list = json_decode($user_list_json,true);
        }
        $user_list[$user_id] = array(
            'user_name' => $user_name
        );
        file_put_contents('user_list.txt',json_encode($user_list));
        $ret->code = 0;
        $this->replay($ret);

        $online_data = new \stdClass();
        $online_data->event = 'online';
        $online_data->data = new \stdClass();
        $online_data->data->user_name = $user_name;
        $online_data->data->user_id = $user_id ;
        $this->broadcast($online_data);
        $connect_user_list_json = file_get_contents('connect_user_list.txt');
        if(empty($connect_user_list_json)){
            $connect_user_list = array();
        }else{
            $connect_user_list = json_decode($connect_user_list_json,true);
        }
        $connect_user_list[$this->fd] = $user_id;
        file_put_contents('connect_user_list.txt',json_encode($connect_user_list));
	}

	public function msg($data){
        $ret = new \stdClass();
        $ret->data = null;
        $ret->event = 're_msg';
        if(empty($data) || !isset($data->user_id) || !isset($data->content)){//para error
            $ret->code = -1;
            $this->replay($ret);
            return;
        }
        $user_id = $data->user_id;
        $user_list_json = file_get_contents('user_list.txt');
        $user_list = json_decode($user_list_json,true);
        $user_name = $user_list[$user_id]['user_name'];
        $ret->code = 0;
        $this->replay($ret);

        $msg_data = new \stdClass();
        $msg_data->event = 'msg';
        $msg_data->data = new \stdClass();
        $msg_data->data->user_name = $user_name;
        $msg_data->data->user_id = $user_id ;
        $msg_data->data->content = $data->content ;
        $this->broadcast($msg_data);

        $msg_info = array(
            'user_id' => $user_id
            ,'content' => $data->content
            ,'create_time' => date('Y-m-d H:i:s')
        );
	}

    public function close(){
        //通知其他在线的用户
        $ret = new \stdClass();
        $ret->event = 'offline';
        $ret->data = new \stdClass();
        $ret->data->user_name = '老子';
        $ret->data->user_id = '-1' ;
        $this->broadcast($ret);
    }
}