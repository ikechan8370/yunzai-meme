import fetch from 'node-fetch';
const baseurl = 'https://memes.ikechan8370.com'
let keysRes = await fetch(`${baseurl}/memes/keys`)
let keys = await keysRes.json()

let keyMap = {}
let infos = {}
for (const key of keys) {
    let keyInfoRes = await fetch(`${baseurl}/memes/${key}/info`)
    let info = await keyInfoRes.json()
    info.keywords.forEach(keyword => {
        keyMap[keyword] = key
    })
    infos[key] = info
}

console.log(keyMap)
console.log(infos)
