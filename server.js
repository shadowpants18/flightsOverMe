const fetch = require('node-fetch');
const config = require('./config.json')

const url = 'https://opensky-network.org/api/states/all?'
const params = new URLSearchParams({ 
  lamin: config.lamin,
  lomin: config.lomin,
  lamax: config.lamax,
  lomax: config.lomax
})

async function main(){
  while(true){
    await new Promise(resolve => setTimeout(resolve, 5000));
    try{
      fetch(url + params).then(res=>{
        res.json().then(json=>{
          console.log(json, "\nnew line")
        })
      })
    }catch(e){
      console.error(e)
    }
  }
}

main()