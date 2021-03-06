const {google} = require('googleapis')
const credentials = require('./credentials.json')
const mongo = require('./mongo')
const chalk = require('chalk')

class Crawler {
  constructor (options) {
    // options
    this.youtube = google.youtube({ version: 'v3', auth: options.apiKey })
    this.crawlerId = options.crawlerId

    // setup
    this.start = Date.now()
    this.usedQueries = 0
    this.dailyQuota = 5e4 // 50k
  }

  run () {
    this.next()
  }

  async mongoGetNextChannel () {
    let db = await mongo.getDB()
    let response = await db.collection('crawled').findOneAndUpdate({crawledChannelInfo: {$exists: false}}, {$set: {crawledChannelInfo: true}})
    let channelId = response.value.channelId
    if (typeof channelId === 'undefined') throw "channelId empty"
    return channelId
  }

  async mongoGet50Channels () {
    let channels = []
    for (var i = 0; i < 50; i++) {
      try {
        let channelId = await this.mongoGetNextChannel()
        channels.push(channelId)
      } catch (e) {
        console.log(e)
      }
    }
    return channels
  }

  async mongoSetChannelInfo (channelId, info) {
    let db = await mongo.getDB()
    if (info && info.statistics && info.statistics.viewCount) info.statistics.viewCount = parseInt(info.statistics.viewCount)
    if (info && info.statistics && info.statistics.subscriberCount) info.statistics.subscriberCount = parseInt(info.statistics.subscriberCount)
    if (info && info.statistics && info.statistics.videoCount) info.statistics.videoCount = parseInt(info.statistics.videoCount)
    db.collection('channel_info').insertOne({channelId, crawlDate: Date.now(), info})
  }

  async next () {
    let pullStartTime = Date.now()
    let channelIds = await this.mongoGet50Channels() //.catch(err => { console.error(err); process.exit(0) }) // fatal errror
    if (channelIds.length === 0) return false
    let pullChannelTime = Date.now()
    try {
      let channelInfoArray = await this.getChannelInfo(channelIds)
      channelInfoArray.forEach((info) => {
        this.mongoSetChannelInfo(info.id, info).catch(err => { console.error(err)})
      })
      let pullDataTime = Date.now()
      let channelTime = '' + (pullChannelTime - pullStartTime)
      let dataTime = '' + (pullDataTime - pullChannelTime)
      console.log(`${this.crawlerId} db:${channelTime} yt:${dataTime}`)
      // console.log(`${chalk.bgGreen(this.crawlerId + ' ' + channelId)} mongodb:${channelTime > 1000 ? chalk.red(channelTime) : channelTime}ms youtube-aip: ${dataTime > 1000 ? chalk.cyan(dataTime) : dataTime}ms`)
    } catch (err) {
      let queryTime = '' + (Date.now() - pullStartTime)
      console.log(chalk.red(`${this.crawlerId} err:${err.code} t:${queryTime}`))
      // console.log(`${chalk.bgRedBright(this.crawlerId + ' ' + err.code)} query-time: ${queryTime > 1000 ? chalk.cyan(queryTime) : queryTime}ms`)
    } finally {
      setTimeout(() => { this.next() }, this.pace())
    }
  }

  pace () {
    let millisecondQuota = (((this.dailyQuota / 24) / 60) / 60) / 1000
    let timeRunning = Date.now() - this.start
    let expectedQueries = Math.floor(timeRunning * millisecondQuota)
    let overusedQueries = this.usedQueries - expectedQueries
    let waitMilliseconds = overusedQueries / millisecondQuota
    if (waitMilliseconds < 0) waitMilliseconds = 0
    return waitMilliseconds
  }

  async getChannelInfo (channelIds) {
    this.usedQueries++
    let res = await this.youtube.channels.list({
      part: 'id,snippet,statistics',
      maxResults: 50,
      fields: 'items(id,snippet(title,description,thumbnails(default,high)),statistics(viewCount,subscriberCount,videoCount))',
      id: channelIds.join(',')
    })
    return res.data.items
  }

}

setTimeout(() => { let crawler1 = new Crawler({ crawlerId: 1, apiKey: credentials["youtube-scraper-1"] }); crawler1.run() }, Math.random() * 10000)
setTimeout(() => { let crawler2 = new Crawler({ crawlerId: 2, apiKey: credentials["youtube-scraper-2"] }); crawler2.run() }, Math.random() * 10000)
setTimeout(() => { let crawler3 = new Crawler({ crawlerId: 3, apiKey: credentials["youtube-scraper-3"] }); crawler3.run() }, Math.random() * 10000)
setTimeout(() => { let crawler4 = new Crawler({ crawlerId: 4, apiKey: credentials["youtube-scraper-4"] }); crawler4.run() }, Math.random() * 10000)
setTimeout(() => { let crawler5 = new Crawler({ crawlerId: 5, apiKey: credentials["youtube-scraper-5"] }); crawler5.run() }, Math.random() * 10000)
setTimeout(() => { let crawler6 = new Crawler({ crawlerId: 6, apiKey: credentials["youtube-scraper-6"] }); crawler6.run() }, Math.random() * 10000)
setTimeout(() => { let crawler7 = new Crawler({ crawlerId: 7, apiKey: credentials["youtube-scraper-7"] }); crawler7.run() }, Math.random() * 10000)
setTimeout(() => { let crawler8 = new Crawler({ crawlerId: 8, apiKey: credentials["youtube-scraper-8"] }); crawler8.run() }, Math.random() * 10000)
setTimeout(() => { let crawler9 = new Crawler({ crawlerId: 9, apiKey: credentials["youtube-scraper-9"] }); crawler9.run() }, Math.random() * 10000)
setTimeout(() => { let crawler10 = new Crawler({ crawlerId: 10, apiKey: credentials["youtube-scraper-10"] }); crawler10.run() }, Math.random() * 10000)

setTimeout(() => { let crawler1 = new Crawler({ crawlerId: 11, apiKey: credentials["youtube-scraper-1"] }); crawler1.run() }, Math.random() * 10000)
setTimeout(() => { let crawler2 = new Crawler({ crawlerId: 12, apiKey: credentials["youtube-scraper-2"] }); crawler2.run() }, Math.random() * 10000)
setTimeout(() => { let crawler3 = new Crawler({ crawlerId: 13, apiKey: credentials["youtube-scraper-3"] }); crawler3.run() }, Math.random() * 10000)
setTimeout(() => { let crawler4 = new Crawler({ crawlerId: 14, apiKey: credentials["youtube-scraper-4"] }); crawler4.run() }, Math.random() * 10000)
setTimeout(() => { let crawler5 = new Crawler({ crawlerId: 15, apiKey: credentials["youtube-scraper-5"] }); crawler5.run() }, Math.random() * 10000)
setTimeout(() => { let crawler6 = new Crawler({ crawlerId: 16, apiKey: credentials["youtube-scraper-6"] }); crawler6.run() }, Math.random() * 10000)
setTimeout(() => { let crawler7 = new Crawler({ crawlerId: 17, apiKey: credentials["youtube-scraper-7"] }); crawler7.run() }, Math.random() * 10000)
setTimeout(() => { let crawler8 = new Crawler({ crawlerId: 18, apiKey: credentials["youtube-scraper-8"] }); crawler8.run() }, Math.random() * 10000)
setTimeout(() => { let crawler9 = new Crawler({ crawlerId: 19, apiKey: credentials["youtube-scraper-9"] }); crawler9.run() }, Math.random() * 10000)
setTimeout(() => { let crawler10 = new Crawler({ crawlerId: 20, apiKey: credentials["youtube-scraper-10"] }); crawler10.run() }, Math.random() * 10000)

setTimeout(() => { let crawler1 = new Crawler({ crawlerId: 21, apiKey: credentials["youtube-scraper-1"] }); crawler1.run() }, Math.random() * 10000)
setTimeout(() => { let crawler2 = new Crawler({ crawlerId: 22, apiKey: credentials["youtube-scraper-2"] }); crawler2.run() }, Math.random() * 10000)
setTimeout(() => { let crawler3 = new Crawler({ crawlerId: 23, apiKey: credentials["youtube-scraper-3"] }); crawler3.run() }, Math.random() * 10000)
setTimeout(() => { let crawler4 = new Crawler({ crawlerId: 24, apiKey: credentials["youtube-scraper-4"] }); crawler4.run() }, Math.random() * 10000)
setTimeout(() => { let crawler5 = new Crawler({ crawlerId: 25, apiKey: credentials["youtube-scraper-5"] }); crawler5.run() }, Math.random() * 10000)
setTimeout(() => { let crawler6 = new Crawler({ crawlerId: 26, apiKey: credentials["youtube-scraper-6"] }); crawler6.run() }, Math.random() * 10000)
setTimeout(() => { let crawler7 = new Crawler({ crawlerId: 27, apiKey: credentials["youtube-scraper-7"] }); crawler7.run() }, Math.random() * 10000)
setTimeout(() => { let crawler8 = new Crawler({ crawlerId: 28, apiKey: credentials["youtube-scraper-8"] }); crawler8.run() }, Math.random() * 10000)
setTimeout(() => { let crawler9 = new Crawler({ crawlerId: 29, apiKey: credentials["youtube-scraper-9"] }); crawler9.run() }, Math.random() * 10000)
setTimeout(() => { let crawler10 = new Crawler({ crawlerId: 30, apiKey: credentials["youtube-scraper-10"] }); crawler10.run() }, Math.random() * 10000)

setTimeout(() => { let crawler1 = new Crawler({ crawlerId: 31, apiKey: credentials["youtube-scraper-1"] }); crawler1.run() }, Math.random() * 10000)
setTimeout(() => { let crawler2 = new Crawler({ crawlerId: 32, apiKey: credentials["youtube-scraper-2"] }); crawler2.run() }, Math.random() * 10000)
setTimeout(() => { let crawler3 = new Crawler({ crawlerId: 33, apiKey: credentials["youtube-scraper-3"] }); crawler3.run() }, Math.random() * 10000)
setTimeout(() => { let crawler4 = new Crawler({ crawlerId: 34, apiKey: credentials["youtube-scraper-4"] }); crawler4.run() }, Math.random() * 10000)
setTimeout(() => { let crawler5 = new Crawler({ crawlerId: 35, apiKey: credentials["youtube-scraper-5"] }); crawler5.run() }, Math.random() * 10000)
setTimeout(() => { let crawler6 = new Crawler({ crawlerId: 36, apiKey: credentials["youtube-scraper-6"] }); crawler6.run() }, Math.random() * 10000)
setTimeout(() => { let crawler7 = new Crawler({ crawlerId: 37, apiKey: credentials["youtube-scraper-7"] }); crawler7.run() }, Math.random() * 10000)
setTimeout(() => { let crawler8 = new Crawler({ crawlerId: 38, apiKey: credentials["youtube-scraper-8"] }); crawler8.run() }, Math.random() * 10000)
setTimeout(() => { let crawler9 = new Crawler({ crawlerId: 39, apiKey: credentials["youtube-scraper-9"] }); crawler9.run() }, Math.random() * 10000)
setTimeout(() => { let crawler10 = new Crawler({ crawlerId: 40, apiKey: credentials["youtube-scraper-10"] }); crawler10.run() }, Math.random() * 10000)
