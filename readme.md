How to install
1.Clone the repo
2.Run npm install
3.edit config.json > look below
4.npm start

EDIT CONFIG.JSON AND FILL IN THE VALUES NEEDED
setBoundaries: default = true, set to false if you want specify a center coordinate and a radius rather than boundaries. 

If setBoundaries is true:\n
  lamin: set to the minimum latitude to detect\n
  lamax: set to the maximum latitude to detect\n
  lomin: set to the minimum longitude to detect\n
  lomax: set to the maximum longitude to detect\n

If setBoundaries is false:\n
  latlong: list containing the latitude and longitude [lat, long]\n
  radius: radius in kilometers(max of 1000)\n