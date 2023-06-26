// import fetch from 'node-fetch';
import fs from 'fs'
const baseUrl = ''

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
let infos = infosTmp
let keyMap = keyMapTmp
fs.writeFileSync('keyMap.json', JSON.stringify(keyMap))
fs.writeFileSync('infos.json', JSON.stringify(infos))