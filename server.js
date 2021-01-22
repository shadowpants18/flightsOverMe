const fetch = require('node-fetch');
const config = require('./config.json')

const url = 'https://opensky-network.org/api/states/all?'

let params

function calculateDistance(radius, lat, long){
  let latDif = radius/110.574
  let lat1 = lat - latDif
  let lat2 = lat + latDif
  let longDif = radius / (111.320 * Math.cos(latDif * Math.PI/180))
  let long1 = long - longDif 
  let long2 = long + longDif
  return [lat1, long1, lat2, long2]
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

async function main(run){
  while(true){
    await new Promise(resolve => setTimeout(resolve, 5000));
    try{
      fetch(url + params).then(res=>{
        res.json().then(json=>{
          console.log(json, "\nnew line")
          return json
        })
      })
    }catch(e){
      console.error(e)
    }
  }
}

main()