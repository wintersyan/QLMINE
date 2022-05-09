/**
 * V1.2
 * 请到环境变量填写相应的参数 2个必填，1个选填
 * 使用服务密码登录抓取https://uac.10010.com/oauth2/new_auth?req_time=的包
 * ltwtCK   必填参数 请求header里面的【ckuuid;acw_tcXXXX;_uop_idXXXX】这三个缺一不可
 * ltwtbody 必填参数 请求body  里面的【app_code=WECHAT&user_id=XXXXX】完整复制
 * ltwtUA   选填参数 //小程序UA,可忽略不填
 * 多账号@隔开，UA填一个就好
 * 更新地址 https://gitee.com/GJ168/script/raw/master/ltwt.js
 * 青龙面板限定，其他的我没用过可能会出错,有bug反馈。萌新代码质量有点差...
 */


const $ = Env('联通微厅')
let ltwtCK = ($.isNode() ? process.env.ltwtCK : $.getdata('ltwtCK')) || "";
let ltwtbody = ($.isNode() ? process.env.ltwtbody : $.getdata('ltwtbody')) || "";
let UA = ($.isNode() ? process.env.ltwtUA : $.getdata('ltwtUA')) || "Mozilla/5.0 (Linux; Android 11; Redmi 8848666 Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3211 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/562 MicroMessenger/8.0.20.2100(0x280014F1) Process/toolsmp WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64";
let msg = '';
let CK_Arr = [];
let Body_Arr = [];

async function getCK() {
    if (!ltwtCK) {
        console.log(`【${$.name}】：噢，伙计，我是说你应该检查一下变量ltwtCK是否存在`)
        return;
    } else {
        if (ltwtCK.indexOf("@") != -1) {
            ltwtCK.split("@").forEach((e) => {
                CK_Arr.push(e);
            });
        } else {
            CK_Arr.push(ltwtCK);
        }
    }
    return true;
}
async function getBody() {
    if (!ltwtbody) {
        console.log(`【${$.name}】：噢，伙计，我是说你应该检查一下变量ltwtbody是否存在`)
        return;
    } else {
        if (ltwtbody.indexOf("@") != -1) {
            ltwtbody.split("@").forEach((e) => {
                Body_Arr.push(e);
            });
        } else {
            Body_Arr.push(ltwtbody);
        }
    }
    return true;
}


!(async () => {
    if (!(await getCK()) || !(await getBody()))
        return;
    else {
        $.log('当前账号有' + CK_Arr.length + '个')
        for (let i = 1; i < CK_Arr.length + 1; i++) {
            $.log('开始第' + i + '个账号')
            await run(i - 1)
            await $.wait(10000)
            await SendMsg(msg)
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

function run(index) {
    return new Promise(async (resolve) => {
        async function timeStamp() {
            return new Date(
                new Date().getTime() +
                new Date().getTimezoneOffset() * 60 * 1000 +
                8 * 60 * 60 * 1000
            ).getTime()
        }

        let ref = ''
        let a = Body_Arr[0].indexOf('state'), b = Body_Arr[0].slice(a),c = b.slice(b.indexOf('=') + 1, b.indexOf('%'))
        ref = 'https://uac.10010.com/oauth2/new_auth?app_code=WECHAT&display=web&page_type=10&redirect_uri=http://weixin.10010.com/wxagent/authBinding&wechat_nick=&state=' + c + ',http%3A%2F%2Fweixin.10010.com%2Fwxagent%2Foauth2%3Ftype%3Dweitingsign_page%2' + c
        let options = {
            url: 'https://uac.10010.com/oauth2/new_auth?req_time=' + await timeStamp(),
            body: Body_Arr[index],
            headers: {
                "Host": "uac.10010.com",
                "content-length": "328",
                "accept": "application/json, text/javascript, */*; q\u003d0.01",
                "x-requested-with": "XMLHttpRequest",
                "user-agent": UA,
                "content-type": "application/x-www-form-urlencoded",
                "origin": "https://uac.10010.com",
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "sec-fetch-dest": "empty",
                "referer": ref,
                "accept-language": "zh-CN,zh;q\u003d0.9,en-US;q\u003d0.8,en;q\u003d0.7",
                "cookie": CK_Arr[index]
            }
        }
        $.post(options, async (err, res, data) => {
            try {
                resp = JSON.parse(data)
                if (!resp.is_authorize) {
                    $.log('第' + (index + 1) + '个账号失效')
                    $.log(resp.rsp_desc)
                    return
                } else {
                    $.log('获取授权码成功\n' + resp.code)
                    await oauth2(index, resp.code)
                }
            }
            catch (e) {
                $.log('第' + (index + 1) + '个账号配置参数无效或其他原因')
                $.logErr(e, res)
            }
            finally {
                resolve();
            }

        })
    })
}

function oauth2(index, code) {
    return new Promise((resolve) => {
        let options = {
            url: 'http://weixin.10010.com/wxagent/authBinding?code=' + code,
            headers: {
                "Host": "weixin.10010.com",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q\u003d0.9,image/avif,image/wxpic,image/tpg,image/webp,image/apng,*/*;q\u003d0.8,application/signed-exchange;v\u003db3;q\u003d0.9",
                "X-Requested-With": "com.tencent.mm",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q\u003d0.9,en-US;q\u003d0.8,en;q\u003d0.7",
                "cookie": CK_Arr[index]
            }
        }

        let CK2 = ''
        CK2 = 'cookie_count_nameentrance_pageweitingsign_page\u003dweitingsign_page'
        CK_Arr[index].split(';').forEach((e) => {
            if (e.indexOf('uop_id') != -1 || e.indexOf('acw_tc') != -1) {
                CK2 += e + ';'
            }
        })
        let header = {
            "Cookie": CK2,
            "Host": "weixin.10010.com",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q\u003d0.9,image/avif,image/wxpic,image/tpg,image/webp,image/apng,*/*;q\u003d0.8,application/signed-exchange;v\u003db3;q\u003d0.9",
            "X-Requested-With": "com.tencent.mm",
            "Accept-Language": "zh-CN,zh;q\u003d0.9,en-US;q\u003d0.8,en;q\u003d0.7",
        }
        $.get(options, async (err, res, data) => {
            try {
                let raw_Arr = []
                res.headers['set-cookie'].forEach((e) => {
                    raw_Arr.push(e)
                })
                async function token() {

                    for (let i = 0; i < raw_Arr.length; i++) {
                        header.Cookie += raw_Arr[i]
                        if (raw_Arr[i].indexOf('TOKEN') != -1) {
                            $.log('获取Token成功')
                            console.log(raw_Arr[i])
                            return 1
                        }
                    }
                }
                if (await token()) {
                    if (data.indexOf('绑定失败') != -1 || data.indexOf('出错了') != -1) {
                        $.log('用户认证失败')
                        return
                    } else {
                        $.log('用户认证成功')
                        await jifen(header)
                        await addCount(header)
                        await sta(header)
                        await jsSDK(header)
                        await userinfo(index, header)
                    }
                } else {
                    $.log('获取Token失败')
                    $.log(data)
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve()
            }
        })
    })
}
function jifen(header) {
    return new Promise((resolve) => {
        let options = {
            url: 'http://weixin.10010.com/wxActivity/jifen/qryUserAllBooks',
            headers: header
        }
        $.get(options, async (err, res, data) => {
            try {
                resp = JSON.parse(data)
                if (resp.code == 2001) {
                    $.log('积分获取失败')
                } else {
                    let info = ''
                    info += '\n【微厅积分】 ' + resp.jiangliBalance
                    info += '\n【定向积分】 ' + resp.dingxiangBalance
                    $.log(info)
                    msg += info
                }
            }
            catch (e) {
                $.logErr(e, res)
            }
            finally {
                resolve();
            }
        })
    })
}

function addCount(header) {
    return new Promise((resolve) => {
        let options = {
            url: 'http://weixin.10010.com/wxActivity/common/addCount',
            body: 'type=wtsign&channel=sign_pv&province=000',
            headers: header
        }
        $.post(options, async (err, res, data) => {
            try {
                console.log(data)
            }
            catch (e) {
                $.logErr(e, res)
            }
            finally {
                resolve();
            }
        })
    })
}

function sta(header) {
    return new Promise((resolve) => {
        let options = {
            url: 'http://weixin.10010.com/wxActivity/wtsign/getstatus',
            headers: header
        }
        $.post(options, async (err, res, data) => {
            try {
                $.log(JSON.parse(data).code == 1001 ? '参数校验失败' : '参数校验成功')
            }
            catch (e) {
                $.logErr(e, res)
            }
            finally {
                resolve();
            }
        })
    })
}

function jsSDK(header) {
    return new Promise((resolve) => {
        let options = {
            url: 'http://weixin.10010.com/wxActivity/jsSDK/signature?url=http://weixin.10010.com/wxActivity/wtsign/signPage',
            headers: header
        }
        $.get(options, async (err, res, data) => {
            try {
            }
            catch (e) {
                $.logErr(e, res)
            }
            finally {
                resolve();
            }
        })
    })
}

function userinfo(header) {
    return new Promise((resolve) => {
        let options = {
            url: 'http://weixin.10010.com/wxActivity/wtsign/signPage',
            headers: header
        }
        $.get(options, async (err, res, data) => {
            try {
                if (data.indexOf('出错了') != -1) {
                    $.log('获取个人信息失败')
                } else {
                    async function val(t) {
                        let a = data.indexOf(t), val = data.slice(a), b = a + val.indexOf(`">`) + 2, c = val.indexOf(`<`) + a
                        return data.slice(b, c)
                    }
                    let info = ''
                    info += '\n【用户号码】 ' + await val('myJF')
                    info += '\n【连续签到】 ' + await val('fenShu') + '天'
                    msg += info
                    console.log(info)
                }
            }
            catch (e) {
                $.logErr(e, res)
            }
            finally {
                resolve();
            }
        })
    })
}

async function SendMsg(message) {
    if (!message)
        return;
    if ($.isNode()) {
        var notify = require('./sendNotify');
        await notify.sendNotify($.name, message);
    } else {
        $.msg(message);
    }
}

function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }