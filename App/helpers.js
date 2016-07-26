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
	
	
	// Promise helpers pulled from: http://stackoverflow.com/a/26694807/2619972
	// Helper delay function to wait a specific amount of time.
	static delay(time){
		return new Promise((resolve) => {
			setTimeout(resolve, time);
		});
	}

	// A function to just keep retrying forever.
	static runFunctionWithRetries(func, initialTimeout, increment){
		return func().catch(function(err){
			return Helpers.delay(initialTimeout).then(function(){
				return Helpers.runFunctionWithRetries(
						func, initialTimeout + increment, increment);
			});
		});
	}

	// Helper to retry a function, with incrementing and a max timeout.
	static runFunctionWithRetriesAndMaxTimeout(
			func, initialTimeout, increment, maxTimeout){

		var overallTimeout = Helpers.delay(maxTimeout).then(function(){
			// Reset the function so that it will succeed and no 
			// longer keep retrying.
			func = function(){ return Promise.resolve() };
			throw new Error('Function hit the maximum timeout');
		});

		// Keep trying to execute 'func' forever.
		var operation = Helpers.runFunctionWithRetries(function(){
			return func();
		}, initialTimeout, increment);

		// Wait for either the retries to succeed, or the timeout to be hit.
		return Promise.race([operation, overallTimeout]);
	}
	
	static distinctObjects(objArray, propsToCheck)
	{
		var newArray = [];
		objArray.forEach(o => {
			//if none of the elemnts in the newArrayMatch
			var matches = newArray.filter(n => propsToCheck.every(prop => n[prop] === o[prop]));
			
			if (matches.length == 0) {
				newArray.push(o);
			}
		});
		return newArray;
	}
}