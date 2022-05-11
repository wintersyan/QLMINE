/*
此文件为Node.js专用。其他用户请忽略
 */
//此处填写快手账号cookie。
let CookieJDs = [
  'kuaishou.api_st=kuaishou.api_st=Cg9rdWFpc2hvdS5hcGkuc3QSsAE_bqetIqoy9uF4QZbrz-Rl2OwbHymTpfXc2qOxI0FHukQIZ98AbKJ3hMwY75KXEllsCOEh9UZGN1nx9kNl7bXeK-g9lU_CoKxhvEv40sT5IZ-mcOvrrbS_9etyF6UPX7N8nY5eOFiC4h3ca9Kra0cGiilpLcdSyP6xn7_Wz1Fb7Zn_sK9AuXZyGCysi4amR7jGmfBSrhTW9m3qmRktWM0aOqHuq6tFDNJXPDWxqZt6NRoSgZ_Nba6SSgega5pcXl8O1pthIiA1K2eLdWWDtIroENU3HD2b7NwkN39xFhjZ3l7AlDLnSSgFMAE;',//账号一ck,例:kuaishou.api_st=xxxxx;
  //账号二ck,例:kuaishou.api_st=xxxxx;
]
// 判断环境变量里面是否有快手ck
if (process.env.ksjsbCookie) {
  if (process.env.ksjsbCookie.indexOf('@') > -1) {
    CookieJDs = process.env.ksjsbCookie.split('@');
  } else if (process.env.ksjsbCookie.indexOf('\n') > -1) {
    CookieJDs = process.env.ksjsbCookie.split('\n');
  } else {
    CookieJDs = [process.env.ksjsbCookie];
  }
}
if (JSON.stringify(process.env).indexOf('GITHUB')>-1) {
  console.log(`请勿使用github action运行此脚本,无论你是从你自己的私库还是其他哪里拉取的源代码，都会导致我被封号\n`);
  !(async () => {
    await require('./sendNotify').sendNotify('提醒', `请勿使用github action、滥用github资源会封我仓库以及账号`)
    await process.exit(0);
  })()
}
CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
console.log(`\n====================共${CookieJDs.length}个快手账号Cookie=========\n`);
console.log(`==================脚本执行- 北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString()}=====================\n`)
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
for (let i = 0; i < CookieJDs.length; i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}
