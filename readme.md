How to install  
1.Clone the repo   
2.Run npm install  
3.edit config.json > look below  
4.npm start  

EDIT CONFIG.JSON AND FILL IN THE VALUES NEEDED  
setBoundaries: default = true, set to false if you want specify a center coordinate and a radius rather than boundaries.   
  
If setBoundaries is true:  
lamin: set to the minimum latitude to detect  
lamax: set to the maximum latitude to detect  
lomin: set to the minimum longitude to detect  
lomax: set to the maximum longitude to detect  
  
If setBoundaries is false:  
latlong: list containing the latitude and longitude [lat, long]  
radius: radius in kilometers(max of 1000)  

Twitter keys:  
access_token_key:  
access_token_secret:  
consumer_key:  
consumer_secret:  

screenshot:(default false) Turn to true if you want screenshots, (takes screenshot of the map on flightradar24)

<h2>Currently, the screenshot functionality is only working on windows, make sure you have chromedriver installed<h2>
