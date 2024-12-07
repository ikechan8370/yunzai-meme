import plugin from '../../lib/plugins/plugin.js'
import fetch, { File, FormData } from 'node-fetch'
import fs from 'fs'
import path from 'node:path'
import _ from 'lodash'

if (!global.segment) {
  global.segment = (await import('oicq')).segment
}
const baseUrl = 'https://memes.ikechan8370.com'
/**
 * 机器人发表情是否引用回复用户
 * @type {boolean}
 */
const reply = true
/**
 * 是否强制使用#触发命令
 */
const forceSharp = false
/**
 * 主人保护，撅主人时会被反撅 (暂时只支持QQ)
 * @type {boolean}
 */
const masterProtectDo = true
/**
 * 用户输入的图片，最大支持的文件大小，单位为MB
 * @type {number}
 */
const maxFileSize = 10

let keyMap = {}

let infos = {}

/**
 * 主人保护list 如['lash','do','beat_up','little_do']
 */
let protectList = []
export class memes extends plugin {
  constructor () {
    let option = {
      /** 功能名称 */
      name: '表情包',
      /** 功能描述 */
      dsc: '表情包制作',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^(#)?(meme(s)?|表情包)列表$',
          /** 执行方法 */
          fnc: 'memesList'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?随机(meme(s)?|表情包)',
          /** 执行方法 */
          fnc: 'randomMemes'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?(meme(s)?|表情包)帮助',
          /** 执行方法 */
          fnc: 'memesHelp'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?(meme(s)?|表情包)搜索',
          /** 执行方法 */
          fnc: 'memesSearch'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?(meme(s)?|表情包)更新',
          /** 执行方法 */
          fnc: 'memesUpdate'
        }

      ]

    }
    Object.keys(keyMap).forEach(key => {
      let reg = forceSharp ? `^#${key}` : `^#?${key}`
      option.rule.push({
        /** 命令正则匹配 */
        reg,
        /** 执行方法 */
        fnc: 'memes'
      })
    })

    super(option)

    // generated by ChatGPT
    function generateCronExpression () {
      // 生成每天的半夜2-4点之间的小时值（随机选择）
      const hour = Math.floor(Math.random() * 3) + 2

      // 生成每小时的随机分钟值（0到59之间的随机数）
      const minute = Math.floor(Math.random() * 60)

      // 构建 cron 表达式
      return `${minute} ${hour} * * *`
    }

    this.task = {
      // 每天的凌晨3点执行
      cron: generateCronExpression(),
      name: 'memes自动更新任务',
      fnc: this.init.bind(this)
    }
  }

  async init () {
    mkdirs('data/memes')
    keyMap = {}
    infos = {}
    if (fs.existsSync('data/memes/infos.json')) {
      infos = fs.readFileSync('data/memes/infos.json')
      infos = JSON.parse(infos)
    }
    if (fs.existsSync('data/memes/keyMap.json')) {
      keyMap = fs.readFileSync('data/memes/keyMap.json')
      keyMap = JSON.parse(keyMap)
    }
    if (Object.keys(infos).length === 0) {
      logger.mark('yunzai-meme infos资源本地不存在，正在远程拉取中')
      let infosRes = await fetch(`${baseUrl}/memes/static/infos.json`)
      if (infosRes.status === 200) {
        infos = await infosRes.json()
        fs.writeFileSync('data/memes/infos.json', JSON.stringify(infos))
      }
    }
    if (Object.keys(keyMap).length === 0) {
      logger.mark('yunzai-meme keyMap资源本地不存在，正在远程拉取中')
      let keyMapRes = await fetch(`${baseUrl}/memes/static/keyMap.json`)
      if (keyMapRes.status === 200) {
        keyMap = await keyMapRes.json()
        fs.writeFileSync('data/memes/keyMap.json', JSON.stringify(keyMap))
      }
    }
    if (Object.keys(infos).length === 0 || Object.keys(keyMap).length === 0) {
      // 只能本地生成了
      let keysRes = await fetch(`${baseUrl}/memes/keys`)
      let keys = await keysRes.json()

      let keyMapTmp = {}
      let infosTmp = {}
      for (const key of keys) {
        let keyInfoRes = await fetch(`${baseUrl}/memes/${key}/info`)
        let info = await keyInfoRes.json()
        info.keywords.forEach(keyword => {
          keyMapTmp[keyword] = key
        })
        infosTmp[key] = info
      }
      infos = infosTmp
      keyMap = keyMapTmp
      fs.writeFileSync('data/memes/keyMap.json', JSON.stringify(keyMap))
      fs.writeFileSync('data/memes/infos.json', JSON.stringify(infos))
    }
    let rules = []
    Object.keys(keyMap).forEach(key => {
      let reg = forceSharp ? `^#${key}` : `^#?${key}`
      rules.push({
        /** 命令正则匹配 */
        reg,
        /** 执行方法 */
        fnc: 'memes'
      })
    })
    this.rule = rules
  }

  async memesUpdate (e) {
    await e.reply('yunzai-memes更新中')
    if (fs.existsSync('data/memes/infos.json')) {
      fs.unlinkSync('data/memes/infos.json')
    }
    if (fs.existsSync('data/memes/keyMap.json')) {
      fs.unlinkSync('data/memes/keyMap.json')
    }
    try {
      await this.init()
    } catch (err) {
      await e.reply('更新失败：' + err.message)
    }
    await e.reply('更新完成')
  }

  async memesHelp (e) {
    e.reply('【memes列表】：查看支持的memes列表\n【{表情名称}】：memes列表中的表情名称，根据提供的文字或图片制作表情包\n【随机meme】：随机制作一些表情包\n【meme搜索+关键词】：搜索表情包关键词\n【{表情名称}+详情】：查看该表情所支持的参数')
  }

  async memesSearch (e) {
    let search = e.msg.replace(/^#?(meme(s)?|表情包)搜索/, '').trim()
    if (!search) {
      await e.reply('你要搜什么？')
      return true
    }
    let hits = Object.keys(keyMap).filter(k => k.indexOf(search) > -1)
    let result = '搜索结果'
    if (hits.length > 0) {
      for (let i = 0; i < hits.length; i++) {
        result += `\n${i + 1}. ${hits[i]}`
      }
    } else {
      result += '\n无'
    }
    await e.reply(result, e.isGroup)
  }

  async memesList (e) {
    let resultFileLoc = 'data/memes/render_list1.jpg'
    if (fs.existsSync(resultFileLoc)) {
      await e.reply(segment.image(`file://${resultFileLoc}`))
      return true
    }
    let response = await fetch(baseUrl + '/memes/render_list', {
      method: 'POST'
    })
    const resultBlob = await response.blob()
    const resultArrayBuffer = await resultBlob.arrayBuffer()
    const resultBuffer = Buffer.from(resultArrayBuffer)
    await fs.writeFileSync(resultFileLoc, resultBuffer)
    await e.reply(segment.image(`file://${resultFileLoc}`))
    setTimeout(async () => {
      await fs.unlinkSync(resultFileLoc)
    }, 3600)
    return true
  }

  async randomMemes (e) {
    let keys = Object.keys(infos).filter(key => infos[key].params_type.min_images === 1 && infos[key].params_type.min_texts === 0)
    let index = _.random(0, keys.length - 1, false)
    console.log(keys, index)
    e.msg = infos[keys[index]].keywords[0]
    return await this.memes(e)
  }

  /**
   * #memes
   * @param e oicq传递的事件参数e
   */
  async memes (e) {
    // console.log(e)
    let msg = e.msg.replace('#', '')
    let keys = Object.keys(keyMap).filter(k => msg.startsWith(k))
    let target = keys[0]
    if (target === '玩' && msg.startsWith('玩游戏')) {
      target = '玩游戏'
    }
    if (target === '舔' && msg.startsWith('舔糖')){
      target = '舔糖'
    }
    if (target === '滚' && msg.startsWith('滚屏')) {
      target = '滚屏'
    }
    if (target === '小丑' && msg.startsWith('小丑面具')) {
      target = '小丑面具'
    }
    let targetCode = keyMap[target]
    // let target = e.msg.replace(/^#?meme(s)?/, '')
    let text1 = _.trimStart(e.msg, '#').replace(target, '')
    if (text1.trim() === '详情' || text1.trim() === '帮助') {
      await e.reply(detail(targetCode))
      return true
    }
    let [text, args = ''] = text1.split('#')
    let userInfos
    let formData = new FormData()
    let info = infos[targetCode]
    let fileLoc
    if (info.params_type.max_images > 0) {
      // 可以有图，来从回复、发送和头像找图
      let imgUrls = []
      if (e.source || e.reply_id ) {
        // 优先从回复找图
        let reply
        if (this.e.getReply) {
          reply = await this.e.getReply()
        } else if (this.e.source) {
          if (this.e.group?.getChatHistory)
            reply = (await this.e.group.getChatHistory(this.e.source.seq, 1)).pop()
          else if (this.e.friend?.getChatHistory)
            reply = (await this.e.friend.getChatHistory(this.e.source.time, 1)).pop()
        }
        if (reply?.message) {
          for (let val of reply.message) {
            if (val.type === 'image') {
              console.log(val)
              imgUrls.push(val.url)
            }
          }
        }
      } else if (e.img) {
        // 一起发的图
        imgUrls.push(...e.img)
      } else if (e.message.filter(m => m.type === 'at').length > 0) {
        // 艾特的用户的头像
        let ats = e.message.filter(m => m.type === 'at')
        imgUrls = ats.map(at => at.qq).map(qq => `https://q1.qlogo.cn/g?b=qq&s=160&nk=${qq}`)
      }
      if (!imgUrls || imgUrls.length === 0) {
        // 如果都没有，用发送者的头像
        imgUrls = [await getAvatar(e)]
      }
      if (imgUrls.length < info.params_type.min_images && imgUrls.indexOf(await getAvatar(e)) === -1) {
        // 如果数量不够，补上发送者头像，且放到最前面
        let me = [await getAvatar(e)]

        imgUrls = me.concat(imgUrls)
        // imgUrls.push(`https://q1.qlogo.cn/g?b=qq&s=160&nk=${e.msg.sender.user_id}`)
      }
      logger.debug('imgUrls:',imgUrls)
      if (protectList.includes(targetCode) && masterProtectDo) {
        let me = [await getAvatar(e)]
        let masters = await getMasterQQ()
        // 有些meme只需要传一张图，此时如果targetQQ是主人，那meme的人就是他自己
        if (imgUrls.length === 1) {
            if (imgUrls[0].startsWith('https://q1.qlogo.cn')) {
                let split = imgUrls[0].split('=')
                let targetQQ = split[split.length - 1]
                if (masters.map(q => q + '').indexOf(targetQQ) > -1) {
                    imgUrls[0] = me
                }
            }
        } else {
            if (imgUrls[1].startsWith('https://q1.qlogo.cn')) {
                let split = imgUrls[1].split('=')
                let targetQQ = split[split.length - 1]
                if (masters.map(q => q + '').indexOf(targetQQ) > -1) {
                    imgUrls = [imgUrls[1]].concat(me)
                }
            }
        }
      }
      imgUrls = imgUrls.slice(0, Math.min(info.params_type.max_images, imgUrls.length))
      for (let i = 0; i < imgUrls.length; i++) {
        let imgUrl = imgUrls[i]
        const imageResponse = await fetch(imgUrl)
        const fileType = imageResponse.headers.get('Content-Type').split('/')[1]
        fileLoc = `data/memes/original/${Date.now()}.${fileType}`
        mkdirs('data/memes/original')
        const blob = await imageResponse.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        await fs.writeFileSync(fileLoc, buffer)
        formData.append('images', new File([buffer], `avatar_${i}.jpg`, { type: 'image/jpeg' }))
      }
    }
    if (text && info.params_type.max_texts === 0) {
      return false
    }
    if (!text && info.params_type.min_texts > 0) {
      if (e.message.filter(m => m.type === 'at').length > 0) {
        text = _.trim(e.message.filter(m => m.type === 'at')[0].text, '@')
      } else {
        text = e.sender.card || e.sender.nickname
      }
    }
    let texts = text.split('/', info.params_type.max_texts)
    if (texts.length < info.params_type.min_texts) {
      await e.reply(`字不够！要至少${info.params_type.min_texts}个用/隔开！`, true)
      return true
    }
    texts.forEach(t => {
      formData.append('texts', t)
    })
    if (info.params_type.max_texts > 0 && formData.getAll('texts').length === 0) {
      if (formData.getAll('texts').length < info.params_type.max_texts) {
        if (e.message.filter(m => m.type === 'at').length > 0) {
          formData.append('texts', _.trim(e.message.filter(m => m.type === 'at')[0].text, '@'))
        } else {
          formData.append('texts', e.sender.card || e.sender.nickname)
        }
      }
    }
    if (e.message.filter(m => m.type === 'at').length > 0) {
      userInfos = e.message.filter(m => m.type === 'at')
      let mm = await e.group.getMemberMap()
      userInfos.forEach(ui => {
        let user = mm.get(ui.qq)
        if (user) {
          ui.gender = user.sex
          ui.text = user.card || user.nickname
        }
      })
    }
    if (!userInfos) {
      userInfos = [{ text: e.sender.card || e.sender.nickname, gender: e.sender.sex }]
    }
    args = handleArgs(targetCode, args, userInfos)
    if (args) {
      formData.set('args', args)
    }
    const images = formData.getAll('images')
    if (checkFileSize(images)) {
      return this.e.reply(`文件大小超出限制，最多支持${maxFileSize}MB`)
    }
    console.log('input', { target, targetCode, images, texts: formData.getAll('texts'), args: formData.getAll('args') })
    let response = await fetch(baseUrl + '/memes/' + targetCode + '/', {
      method: 'POST',
      body: formData
      // headers: {
      // 'Content-Type': 'multipart/form-data'
      // }
    })
    // console.log(response.status)
    if (response.status > 299) {
      let error = await response.text()
      console.error(error)
      await e.reply(error, true)
      return true
    }
    mkdirs('data/memes/result')
    let resultFileLoc = `data/memes/result/${Date.now()}.gif`
    const resultBlob = await response.blob()
    const resultArrayBuffer = await resultBlob.arrayBuffer()
    const resultBuffer = Buffer.from(resultArrayBuffer)
    await fs.writeFileSync(resultFileLoc, resultBuffer)
    await e.reply(segment.image(`file://${resultFileLoc}`), reply)
    fileLoc && await fs.unlinkSync(fileLoc)
    await fs.unlinkSync(resultFileLoc)
  }
}

function handleArgs (key, args, userInfos) {
  if (!args) {
    args = ''
  }
  let argsObj = {}
  switch (key) {
    case 'look_flat': {
      argsObj = { ratio: parseInt(args || '2') }
      break
    }
    case 'crawl': {
      argsObj = { number: parseInt(args) ? parseInt(args) : _.random(1, 92, false) }
      break
    }
    case 'firefly_holdsign': {
      argsObj = { number: parseInt(args) ? parseInt(args) : _.random(1, 21, false) }
      break
    }
    case 'jinhsi': {
      argsObj = { number: parseInt(args) ? parseInt(args) : _.random(1, 12, false) }
      break
    }
    case 'symmetric': {
      let directionMap = {
        左: 'left',
        右: 'right',
        上: 'top',
        下: 'bottom'
      }
      argsObj = { direction: directionMap[args.trim()] || 'left' }
      break
    }
    case 'petpet':
    case 'jiji_king':
    case 'kirby_hammer': {
      argsObj = { circle: args.startsWith('圆') }
      break
    }
    case 'my_friend': {
      if (!args) {
        args = _.trim(userInfos[0].text, '@')
      }
      argsObj = { name: args }
      break
    }
    case 'looklook': {
      argsObj = { mirror: args === '翻转' }
      break
    }
    case 'always': {
      let modeMap = {
        '': 'normal',
        循环: 'loop',
        套娃: 'circle'
      }
      argsObj = { mode: modeMap[args] || 'normal' }
      break
    }
    case 'gun':
    case 'bubble_tea': {
      let directionMap = {
        左: 'left',
        右: 'right',
        两边: 'both'
      }
      argsObj = { position: directionMap[args.trim()] || 'right' }
      break
    }
    case 'dog_dislike' : {
      argsObj = { circle: args.startsWith('圆') }
      break
    }
    case 'clown': {
      argsObj = { person: args.startsWith('爷') }
      break
    }
    case 'note_for_leave': {
      if (args) {
        argsObj = { time: args }
      }
      break
    }
    case 'mourning': {
      argsObj = { black: args.startsWith('黑白') || args.startsWith('灰') }
      break
    }
    case 'genshin_eat': {
      const  roleMap = {
        八重: 1,
        胡桃: 2,
        妮露: 3,
        可莉: 4,
        刻晴: 5,
        钟离: 6
      }
      argsObj = { character: roleMap[args.trim()] || 0 }
      break
    }
    case 'clown_mask': {
      argsObj = { mode: args === '前' ? 'front' : 'behind' }
      break
    }
    case "alipay": {
      argsObj = {
        message: args ? args : "",
      };
      break;
    }
    case "wechat_pay": {
      argsObj = {
        message: args ? args : "",
      };
      break;
    }
    case "panda_dragon_figure": {
      argsObj = {
        name: args || "",
      };
      break;
    }
  }
  argsObj.user_infos = userInfos.map(u => {
    return {
      name: _.trim(u.text, '@'),
      gender: u.gender || 'unknown'
    }
  })
  return JSON.stringify(argsObj)
}

const detail = code => {
  let d = infos[code]
  let keywords = d.keywords.join('、')
  let ins = `【代码】${d.key}\n【名称】${keywords}\n【最大图片数量】${d.params_type.max_images}\n【最小图片数量】${d.params_type.min_images}\n【最大文本数量】${d.params_type.max_texts}\n【最小文本数量】${d.params_type.min_texts}\n【默认文本】${d.params_type.default_texts.join('/')}\n`
  // todo api break change!
  if (d.params_type.args_type?.parser_options.length > 0) {
    let supportArgs = ''
    switch (code) {
      case 'look_flat': {
        supportArgs = '看扁率，数字.如#3'
        break
      }
      case 'crawl': {
        supportArgs = '爬的图片编号，1-92。如#33'
        break
      }
      case 'firefly_holdsign': {
        supportArgs = '流萤举牌的图片编号，1-21。如#2'
        break
      }
      case 'jinhsi': {
        supportArgs = '汐汐的图片编号，1-12。如#2'
        break
      }
      case 'symmetric': {
        supportArgs = '方向，上下左右。如#下'
        break
      }
      case 'dog_dislike':
      case 'petpet':
      case 'jiji_king':
      case 'kirby_hammer': {
        supportArgs = '是否圆形头像，输入圆即可。如#圆'
        break
      }
      case 'always': {
        supportArgs = '一直图像的渲染模式，循环、套娃、默认。不填参数即默认。如一直#循环'
        break
      }
      case 'gun':
      case 'bubble_tea': {
        supportArgs = '方向，左、右、两边。如#两边'
        break
      }
      case 'clown': {
        supportArgs = '是否使用爷爷头轮廓。如#爷'
        break
      }
      case 'note_for_leave': {
        supportArgs = '请假时间。如#2023年11月11日'
        break
      }
      case 'mourning': {
        supportArgs = '是否黑白。如#黑白 或 #灰'
        break
      }
      case 'genshin_eat': {
        supportArgs = '吃的角色(八重、胡桃、妮露、可莉、刻晴、钟离)。如#胡桃'
        break
      }
      case 'clown_mask': {
        supportArgs = '小丑在前或在后，如#前 #后'
        break
      }
      case "alipay": {
        supportArgs = "二维码的内容链接或文本，如#https://gituhub.com";
        break;
      }
      case "wechat_pay": {
        supportArgs = "二维码的内容链接或文本，如#https://gituhub.com";
        break;
      }
      case "panda_dragon_figure": {
        supportArgs = "奇怪龙表情生成，如#原神龙";
        break;
      }
    }
    ins += `【支持参数】${supportArgs}`
  }
  return ins
}

// 最大支持的文件大小（字节）
const maxFileSizeByte = maxFileSize * 1024 * 1024

// 如果有任意一个文件大于 maxSize，则返回true
function checkFileSize (files) {
  let fileList = Array.isArray(files) ? files : [files]
  fileList = fileList.filter(file => !!(file?.size))
  if (fileList.length === 0) {
    return false
  }
  return fileList.some(file => file.size >= maxFileSizeByte)
}

function mkdirs (dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirs(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

async function getMasterQQ () {
  return (await import('../../lib/config/config.js')).default.masterQQ
}

async function getAvatar (e, userId = e.sender.user_id) {
  if (typeof e.getAvatarUrl === 'function') {
    return await e.getAvatarUrl(0)
  }
  return `https://q1.qlogo.cn/g?b=qq&s=0&nk=${userId}`
}
