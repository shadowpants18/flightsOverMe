const fetch = require('node-fetch');
const config = require('./config.json')
const Twitter = require('twitter')
const fs = require('fs')
const imgur = require('imgur')
const util = require('util')
const captureWebsite = require('capture-website')

const date = new Date()
const client = new Twitter({
  consumer_key:config.twitterKeys.consumer_key,
  consumer_secret:config.twitterKeys.consumer_secret,
  access_token_key:config.twitterKeys.access_token_key,
  access_token_secret:config.twitterKeys.access_token_secret
})


let params
const url = 'https://opensky-network.org/api/states/all?'

const readFile = util.promisify(fs.readFile)

function clearDirectory(){

  const directory = 'images';

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
}
function calculateDistance(radius, lat, long){
  let latDif = radius/110.574
  let lat1 = lat - latDif
  let lat2 = lat + latDif
  let longDif = radius / (111.320 * Math.cos(latDif * Math.PI/180))
  let long1 = long - longDif 
  let long2 = long + longDif
  return [lat1, long1, lat2, long2]
}
async function captureSite(lat, long, path){
	await captureWebsite.file(`https://www.flightradar24.com/${lat},${long}/12`, path, {
    width:1080,
    height:1080,
    type: "jpeg",
    hideElements:[
      '.nav-container-bar',
      '#mapView',
      '#responsiveBottomPanel',
      '.important-banner'
    ],
    delay:5,
    overwrite:true,
    scaleFactor:2,
    element:"#map_canvas",

  })
}
  

function TweetTimed(number, time){
  let message = `${number} planes have flown over ${config.locationName} in the last ${time}.`
  client.post('statuses/update', {status: message}).then(tweet=>{
    console.log("Tweeting!")
  })
  .catch(e=>{
    throw e
  })
}


function TweetFlight(plane){
  let message = `#${plane[1]} : A plane has just flown over ${config.locationName} and originated from ${plane[2]}.`
  let path = `./images/screenshot${plane[0]}.jpg`

  if(plane[13] != null){
    message += `\nGeometric altitude: ${plane[13]} meters`
  }
  if(plane[9] != null){
    message += `\nVelocity: ${plane[9]} m/s`
  }
  message += `\nLatitude and longitude: ${plane[6]}, ${plane[5]}`
  
  let roundedLat = Math.ceil(Number(plane[6]) * 100)/100
  let roundedLong = Math.ceil(Number(plane[5]) * 100)/100
  captureSite(roundedLat, roundedLong, path).then(()=>{
    readFile(path).then(data=>{
      client.post('media/upload', {media:data}, (err, media, response)=>{
        if(err) throw err
        let status = {
          status:message,
          media_ids:media.media_id_string
        }
        client.post("statuses/update", status, (err, tweet, response)=>{
          console.log('sending tweet')
        })
      })
    })
  })
  
}

if(config.setBoundaries == true){
  params = new URLSearchParams({ 
    lamin: config.lamin,
    lomin: config.lomin,
    lamax: config.lamax,
    lomax: config.lomax
  })
}else{
  let [lat, long] = config.latlong
  let [lamin, lomin, lamax, lomax] = calculateDistance(config.radius, lat, long)

  params = new URLSearchParams({ 
    lamin: String(lamin),
    lomin: String(lomin),
    lamax: String(lamax),
    lomax: String(lomax)
  })
}

let planesList = []
let hourCount = 0
let dateCount = 0
let hour = date.getHours()
let dateOfMonth = date.getDate()

async function main(run){

  while(true){
    await new Promise(resolve => setTimeout(resolve, 30 * 1000));
    console.log("checking...")
    try{
      clearDirectory()
      fetch(url + params).then(res=>{
        res.json().then(data=>{
          let json = data['states']
          if(data['states'] == null) {
            console.log('no planes')
            return
          }
          if(hour != date.getHours()){
            console.log("Hourly count " + hourCount)
            TweetTimed(hourCount, "hour")
            hour = date.getHours()
            hourCount = 0
          }
          if(dateOfMonth != date.getDate()){
            dateOfMonth = date.getDate()
            console.log("Daily count " + dateCount)
            TweetTimed(dateCount, "day")
            dateCount = 0
          }
          for(let plane of json){
            if(!planesList.includes(plane[0]) && plane[8] == false){
              planesList.push(plane[0])
              hourCount ++
              dateCount ++ 
              TweetFlight(plane);
            }
          }
        })
      })
    }catch(e){
      console.error(e)
    }
  }
}

main()