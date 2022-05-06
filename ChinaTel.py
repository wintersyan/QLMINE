# -*- coding: utf-8 -*-
import base64
import requests,json
import time
from Crypto.Cipher import AES
from binascii import b2a_hex, a2b_hex
from Crypto.Util.Padding import pad

# 青龙安装依赖  pycryptodome

# 安卓用HttpCanary去微信小程序抓包，只能抓用户中心home_info_body的包。
# ios可用Thor去电信营业厅app抓包，Thor可抓所有包，可以PDD买账号下载。Stream无法抓包，其它抓包软件自测。

# 抓包数据填脚本里

# 手机号
config_list = [
   {"mobile": "18166225642", "food": True}
]
# 用户中心
# 抓包url   https://wapside.189.cn:9001/jt-sign/api/home/homeInfo
# home_info_body   {"para":"xx"}
home_info_body = {"para":"8c11d4f52b72e6ab9f914abb10eee9a82337a422ef57e43b652e2ecd322aa7fc337b5c60bc681e080ecf31f6733ef67ee0eb8df7626482b78fa4690289c02c46e9d195b916001f62d173331830403e0bf9c52457fa342395e06fcb69b89ccdfed972864fb060abe371ec6e56e4e02c28ead6e2089883d14dcf50b0cd088e24ba5513c27ceebc2111b74d1fb36b8d062d6c2a440f9ba369beb02ad80138c953b2f84ea9dc8bf615c5d3b906ee8663b179b7e01e9ac09ca6c343cf14ff96c09e6208e208302404878727f0f6a422eaa591dab5c63fd00d9dad0ecdf7029c6438bea6f65d80bb438bdc43093c48c000ea73529ae7180e39300b115de1761c1cf8b8"}

# 喂宠物
# https://wapside.189.cn:9001/jt-sign/paradise/food
# food_body   {"para":"xx"}
food_body = {"para": "10bf094e65f7035c4045f9c3accb8a3fb950c24b055b435e3b842109e4fcc6fead2ec033ef2d2f9e527153a33d4e711b3dde18f717817e04438e7bbc4ec015342503e317446583deae821ffd484aebcae86626326f5bcd24a1a1ceb5da8c1c0c6ff0755187f04f3f5e00256df2bfb0cc3dc1d6bba6120cd507efb7d56d5c049f"}


# 分享  
# https://dxhd.189.cn:7081/actcenter/v1/goldcoinuser/shareToGetCoin.do
# share_body = {
#     'activityId': 'telecomrecommend01',
#     'session': 'xxx'
# }
share_body = {}

# 云盘
# 'https://wapside.189.cn:9001/jt-sign/paradise/polymerize'
# cloud_body = {"para":"xx"}
cloud_body = {}

# 种树
# 'https://wapside.189.cn:9001/jt-sign/paradise/polymerize'
# tree_body = {"para":"xx"}
tree_body = {}


msg = []

def telegram_bot(title, content):
    print("\n")
    title = title  # 改成你要的标题内容
    content = content  # 改成你要的正文内容
    bot_token = ''
    user_id = ''

    print("tg服务启动")
    url=f"https://api.telegram.org/bot{bot_token}/sendMessage"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    payload = {'chat_id': str(user_id), 'text': f'{title}\n\n{content}', 'disable_web_page_preview': 'true'}
    proxies = None
    response = requests.post(url=url, headers=headers, params=payload, proxies=proxies).json()
    if response['ok']:
        print('推送成功！')
    else:
        print('推送失败！')


def encrypt(text):
    key = '34d7cb0bcdf07523'.encode('utf-8')

    cipher = AES.new(key, AES.MODE_ECB)
    pad_pkcs7 = pad(text.encode('utf-8'), AES.block_size, style='pkcs7')  # 选择pkcs7补全
    cipher_text = cipher.encrypt(pad_pkcs7)

    return b2a_hex(cipher_text)

def telecom_task(config):
    mobile = config['mobile']
    msg.append(mobile + " 开始执行任务...")
    h5_headers = get_h5_headers(mobile)
    # 获取用户中心
    home_info_ret = requests.post(url="https://wapside.189.cn:9001/jt-sign/api/home/homeInfo", json=home_info_body, headers=h5_headers).json()
    if home_info_ret['resoultMsg'] != "成功":
        msg.append(home_info_ret['resoultMsg'])
        return
    user_id = home_info_ret['data']['userInfo']['userThirdId']
    old_coin = home_info_ret['data']['userInfo']['totalCoin']

    # 签到
    t = time.time()
    time1 = int(round(t * 1000))
    body_json = {
        "phone": f"{mobile}",
        "date": time1,
        "signSource": "smlprgrm"
    }
    body_str = json.dumps(body_json)
    s = str(encrypt(body_str),'utf-8')
    sign_body = {
        "encode": s
    }

    sign_ret = requests.post(url="https://wapside.189.cn:9001/jt-sign/api/home/sign", json=sign_body,
                             headers=h5_headers).json()
    if sign_ret['data']['code'] == 1:
        msg.append("签到成功, 本次签到获得 " + str(sign_ret['data']['coin']) + " 豆")
    else:
        msg.append(sign_ret['data']['msg'])

    #share
    share(config)
    time.sleep(1)
    # 获取用户中心
    home_info_ret = requests.post(url="https://wapside.189.cn:9001/jt-sign/api/home/homeInfo", json=home_info_body,
                                  headers=h5_headers).json()
    new_coin = home_info_ret['data']['userInfo']['totalCoin']
    msg.append("领取完毕, 现有金豆: " + str(new_coin))
    msg.append("本次领取金豆: " + str(new_coin - old_coin))
    time.sleep(1)
    # 喂食
    food(config)

    msg.append("----------------------------------------------")

def food(config):
    if config['food']:
        mobile = config['mobile']
        msg.append(mobile + " 开始执行喂食...")
        while True:
            food_ret = requests.post(url="https://wapside.189.cn:9001/jt-sign/paradise/food", json=food_body,
                                     headers=get_h5_headers(mobile)).json()
            msg.append(food_ret['resoultMsg'])
            if food_ret['resoultCode'] != '0':
                break

#分享
def share(config):
    mobile = config['mobile']
    msg.append(mobile + "开始执行分享...")
    url = 'https://dxhd.189.cn:7081/actcenter/v1/goldcoinuser/shareToGetCoin.do'
    resp = requests.post(url=url,data=share_body,headers=get_h5_headers(mobile))
    print('share==============')
    print(resp)
    result = resp.text
    print(result)
    msg.append("分享" + result)

    cloud(mobile)
    time.sleep(2)
    tree(mobile)

# cloud
def cloud(mobile):
    msg.append(mobile + "访问云盘...")
    url='https://wapside.189.cn:9001/jt-sign/paradise/polymerize'
    resp = requests.post(url=url, json=cloud_body, headers=get_h5_headers(mobile))
    print('cloud=========')
    print(resp)
    result = resp.json()
    print(result)
    if result['resoultCode'] ==0:
        msg.append("云盘"+result['resoultMsg'])
    else:
        msg.append("云盘访问失败"+result['resoultMsg'])

# tree
def tree(mobile):
    msg.append(mobile + "种树...")
    url='https://wapside.189.cn:9001/jt-sign/paradise/polymerize'
    resp = requests.post(url=url, json=tree_body, headers=get_h5_headers(mobile))
    print('tree=========')
    print(resp)
    result = resp.json()
    print(result)
    if result['resoultCode'] ==0:
        msg.append("种树"+result['resoultMsg'])
    else:
        msg.append("种树访问失败"+result['resoultMsg'])


def get_h5_headers(mobile):
    base64_mobile = str(base64.b64encode(mobile[5:11].encode('utf-8')), 'utf-8').strip(r'=+') + "!#!" + str(
        base64.b64encode(mobile[0:5].encode('utf-8')), 'utf-8').strip(r'=+')
    return {"User-Agent": "CtClient;9.2.0;Android;10;MI 9;" + base64_mobile}


def format_msg():
    str = ''
    for item in msg:
        str += item + "\r\n"
    return str

def main_handler():
    for config in config_list:
        telecom_task(config)
    content = format_msg()

    print(content)
    telegram_bot('电信签到任务', content)
    return content

main_handler()