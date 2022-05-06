'''
20220506  签到，领收益

扫码打开小程序 点击我的 获取ck  

cron自己设置   一天两次次   2 7,12 * * * *

环境变量 export rxsq_tk=''

#热项社圈
抓 https://s78.yyyyy.run/    token

'''

import requests
import json,time
import os,sys,random
import logging


if "DEBUG" in os.environ:  # 判断调试模式变量
    logging.basicConfig(level=logging.DEBUG, format='%(message)s')  # 设置日志为 Debug等级输出
    logger = logging.getLogger(__name__)  # 主模块
    logger.debug("\nDEBUG模式开启!\n")  # 消息输出
else:  # 判断分支
    logging.basicConfig(level=logging.INFO, format='%(message)s')  # Info级日志
    logger = logging.getLogger(__name__)  # 主模块




logger.info("\n------------------🔔热项社圈, 开始!-----------------------\n")

#获取用户信息
def get_user(token):
    url = "https://s78.yyyyy.run/api/user"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 MicroMessenger/7.0.4.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF",
        "token": token
    }   
    body='{}'
    res = requests.post(url=url, headers=headers,data=body)
    res_json = json.loads(res.text)
    logger.debug (res_json)
    logger.info("\n-------------------------------------------\n")
    if res_json['code'] == 1:
        logger.info("\n用户名："+res_json['data']['nickname'])
    else:
        logger.info("\n"+res_json['msg'])

#领取收益
def lingqu(token):
    url = "https://s78.yyyyy.run/api/user/lingqu"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 MicroMessenger/7.0.4.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF",
        "token": token
    }   
    body='{}'
    res = requests.post(url=url, headers=headers,data=body)
    res_json = json.loads(res.text)
    logger.debug(res_json)
    if res_json['code'] == 1:
        logger.info("\n领取权益："+res_json['msg'])
    else:  
        logger.info("\n"+res_json['msg'])

def sign(token):
    url = "https://s78.yyyyy.run/api/sign/userSignIn"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 MicroMessenger/7.0.4.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF",
        "token": token
    }
    body='{}'
    res = requests.post(url=url, headers=headers,data=body)
    res_json = json.loads(res.text)
    logger.debug(res_json)
    if res_json['code'] == 1:
        logger.info("\n签到看视频："+res_json['msg'])
    else:
        logger.info("\n"+res_json['msg'])
#签到
def userSignData(token):
    url = "https://s78.yyyyy.run/api/sign/userSignData"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 MicroMessenger/7.0.4.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF",
        "token": token
    }   
    body='{}'
    res = requests.post(url=url, headers=headers,data=body)
    res_json = json.loads(res.text)
    logger.debug(res_json)
    if res_json['code'] == 1:
        today_count=res_json['data']['today_count']
        logger.info("\n今日已签到"+str(today_count)+"次")
        if today_count==10:
            lingqu(token)
        else:
            for i in range(10-today_count):
                yc=random.randint(65,80)
                sign(token)
                logger.info("\n随机延迟:"+str(yc)+"秒")
                time.sleep(yc)

def xycy_token():  
    if "rxsq_tk" in os.environ: 
        token_list = os.environ['rxsq_tk'].split('&')  
        if len(token_list) > 0:  
            return token_list  
        else:  # 判断分支
            logger.info("rxsq_tk变量未启用")  # 标准日志输出
            sys.exit(1)  # 脚本退出
    else:  # 判断分支
        logger.info("未添加rxsq_tk变量")  # 标准日志输出
        sys.exit(0)  # 脚本退出        
  
token_list=xycy_token()
logger.info("\n------------------共"+str(len(token_list))+"个账号-----------------------\n")
for i in token_list:
    token=i
    time.sleep(1)
    try:
        get_user(token)
    except Exception as e:
        logger.error(e)
    time.sleep(3)
    try:
        userSignData(token)
    except Exception as e:
        logger.error(e)
    time.sleep(3)