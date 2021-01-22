const fetch = require('node-fetch');
const config = require('./config.json')
const Twitter = require('twitter')

const date = new Date()
const twitClient = new Twitter({
  consumer_key:config.twitterKeys.consumer_key,
  consumer_secret:config.twitterKeys.consumer_secret,
  access_token_key:config.twitterKeys.access_token_key,
  access_token_secret:config.twitterKeys.access_token_secret
})

let params
const url = 'https://opensky-network.org/api/states/all?'
function calculateDistance(radius, lat, long){
  let latDif = radius/110.574
  let lat1 = lat - latDif
  let lat2 = lat + latDif
  let longDif = radius / (111.320 * Math.cos(latDif * Math.PI/180))
  let long1 = long - longDif 
  let long2 = long + longDif
  return [lat1, long1, lat2, long2]
}

function TweetTimed(number, time){
  let message = `${number} planes have flown over ${config.locationName} in the last ${time}.`
  twitClient.post('statuses/update', {status: message}).then(tweet=>{
    console.log(tweet)
  })
  .catch(e=>{
    throw e
  })
}

function TweetFlight(plane){
  let message = `#${plane[1]} : A plane has just flown over ${config.locationName} and originated from ${plane[2]}.`
  if(plane[13] != null){
    message += `\nGeometric altitude: ${plane[13]} m/s`
  }
  if(plane[9] != null){
    message += `\nVelocity: ${plane[9]} m/s`
  }
  if(plane[5] != null && plane[6] != null){
    message += `\nLatitude and longitude: ${plane[6]}, ${plane[5]}`
  }
  twitClient.post('statuses/update', {status: message}).then(tweet=>{
    console.log(tweet.text)
  }).catch(e=>{
    throw e
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

async function main(run){
  let hour = date.getHours()
  let dateOfMonth = date.getDate()
  while(true){
    await new Promise(resolve => setTimeout(resolve, 60 * 1000));
    try{
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
              TweetFlight(plane)
            }
          }
        })
      })
    }catch(e){
      console.error(e)
      break
    }
  }
}

main()