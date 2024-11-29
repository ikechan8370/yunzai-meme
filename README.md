# yunzai-meme
![3F53077B8088F0C03FA7C81B2E4CC62A](https://user-images.githubusercontent.com/21212372/228231810-3202ff31-e5ed-4ab8-a93f-a55ab6d48f58.gif)

基于meme-generator的Yunzai机器人的表情包插件

## 更新
支持试用huggingface搭建api了，可以duplicate我的space：https://huggingface.co/spaces/ikechan8370/meme-generator
然后api填https://[username]-meme-generator.hf.space，例如我的就是https://ikechan8370-meme-generator.hf.space
原API将转发到该仓库，对大陆用户可能友好一些

## 可选
提供了一个默认的免费API（[状态](https://avocado-status.ikechan8370.com/status/chatgpt-meme)），要求高稳定性的建议自己搭建，然后修改第9行的baseUrl为你的自建meme api，参考[这里](https://github.com/MeetWq/meme-generator)搭建。可选加入[扩展包](https://github.com/MeetWq/meme-generator-contrib)

更新：提供了一个docker镜像，一键搭建：`docker run -d -p 2233:2233 --restart=always geyinchi/meme-generator:latest`

更新：ARM版镜像，由@Regalia提供：`regaliaf/meme-generator`

更新：MeetWq/meme-generator仓库也提供了docker镜像和Dockfile

要求不高或者没条件可以用内置的API。

## 安装

直接把meme.js扔到plugins/example目录下即可

下载链接：

https://raw.githubusercontent.com/ikechan8370/yunzai-meme/main/meme.js

或者大陆服务器可以用gitee，不一定有github更新及时

https://gitee.com/ikechan/yunzai-meme/raw/main/meme.js

安装后可能需要重启，如果没响应就重启一下试试
可以发送meme更新进行资源的在线更新。

## 食用方法

使用`meme帮助`查看帮助

建议先查看https://github.com/MeetWq/meme-generator 了解支持的表情包及合成要求。

需要图片合成表情包的可以通过回复、艾特（取头像）、默认（自己的头像）获取素材图片

需要文字合成表情包的需要在指令中添加文字，并用/隔开，如：可达鸭我爱你/你爱我

0626更新：`#meme更新`进行在线更新

## 禁用表情
在某些人多的大群里，如果你认为部分表情不适合进行meme，你可以使用以下方式来禁用部分表情（只限制群聊，私聊不限制）  

方式一（适用于自己搭建meme-generator）：
- 第一步：获取需要禁用的表情的【代码】，如“舔”，在群内发送【舔详情】，则机器人会返回“舔”的【代码】为“prpr”
- 第二步：在meme-generator的【meme_generator/memes】目录下，将“prpr”文件夹删除或移动到其他目录，这样可以从根源上直接移除“舔”，机器人所在的所有群里都无法再进行“舔”，【meme列表】中也不会包含“舔”
  
方式二（只在部分群里进行meme限制）：
- 第一步：同方式一，先获取表情代码
- 第二步：将本插件meme.js中的openBlackList从false修改为true
```
let openBlackList = true
```
- 第三步：  

&emsp;&emsp;如果你想让你机器人所在的所有群聊都禁用“舔”和其他一些表情，则在memeBlackList中配置：
```
let memeBlackList = [
    {
        groupId: 'all',
        blackList: ['prpr', 'do', 'little_do']
    }
]
```
&emsp;&emsp;如果你想让你的机器人在群123和群456之中禁用“舔”和其他一些表情，则在memeBlackList中配置：
```
let memeBlackList = [
    {
        groupId: 123,
        blackList: ['prpr', 'do']
    },
    {
        groupId: 456,
        blackList: ['prpr', 'do', 'little_do', 'shoot']
    }
]
```
&emsp;&emsp;备注：方式二无法禁用【meme列表】中的表情（使用方式二禁用“舔”后，虽然【meme列表】中由“舔”，但是机器人不会触发“舔”），【meme列表】由meme-generator根据【meme_generator/memes】目录生成，如果想在【meme列表】不显示“舔”，目前仅支持方式一进行禁用

> 如果觉得有帮助，请帮我点一个免费的Star，谢谢！

## 致谢

* https://github.com/MeetWq/meme-generator
* https://github.com/MeetWq/meme-generator-contrib
