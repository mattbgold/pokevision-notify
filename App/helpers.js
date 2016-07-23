class Helpers {
	static getTimeRemaining(expireTime) {
		var seconds =  Math.round((expireTime - (new Date().getTime()/1000)));
		return {
			m: Math.floor(seconds/60),
			s: seconds % 60 < 10 ? '0'+(seconds % 60).toString() : (seconds % 60).toString()
		};
	}
	
	static calcCrow(lat1, lon1, lat2, lon2) {
		var toRad = function(Value) {
			return Value * Math.PI / 180;
		}
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }
	
	static getDirection(lat1, lon1, lat2, lon2) {
		var rads = Math.atan2(Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1), Math.sin(lon2-lon1)*Math.cos(lat2));
		var degs = rads * (180/Math.PI) + 180;

		var nearestCompassDir = Math.round(degs / 45) * 45;

		return {
			0: 'East', 
			45: 'Northeast', 
			90: 'North', 
			135: 'Northwest', 
			180: 'West', 
			225: 'Southwest', 
			270: 'South', 
			315: 'Southeast', 
			360: 'East'
		}[nearestCompassDir];
	}
}