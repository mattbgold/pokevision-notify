class App {
	constructor(pokemonService, chromeService) {
		this._pokemonService = pokemonService;
		this._chromeService = chromeService;
		
		this._pokeCache = {};
		this._scanInterval = null;
		this._pokemonNotifications = {};
		
		this.isScanning = false;
		this.latitude = 33.774434268927;
		this.longitude = -84.384722855175;
		this.radiusMeters = 500;
		this._chromeService.storageGet('pokemonToIgnore', result =>  {
			this.pokemonToIgnore = result || {};
		});
		
		
		this.error = '';
		
		
		this._chromeService.addListener('start', data => {
			this.latitude = data.latitude;
			this.longitude = data.longitude;
			this.radiusMeters = data.radius;
		
			this.isScanning = true;
			this._pokeCache = {};
			
			this._scanInterval = setInterval(() => this.scan(), 35000);
			this.scan();
		});
		
		this._chromeService.addListener('stop', () => {
			this.isScanning = false;
			this._pokeCache = {};
			this.handleError(''); //clear errors
			
			clearInterval(this._scanInterval);
		});
		
		this._chromeService.addNotificationListener((notificationId) => { //handle button click in notification
			this.pokemonToIgnore[this._pokemonNotifications[notificationId].pokemonId] = true;
			this._chromeService.storageSet('pokemonToIgnore', this.pokemonToIgnore);
			this._chromeService.clearNotification(notificationId);
		});
		
		this._chromeService.addListener('resetIgnore', () => {
			this.pokemonToIgnore = {};
			this._chromeService.storageSet('pokemonToIgnore', {});
		});
		
		this._chromeService.addListener('pokevision', () => {
			this._chromeService.openTab(this._pokemonService.getPokevisionUrl(this.latitude, this.longitude));
		});
		
		this._chromeService.getGeolocation().then(coords => {
			this.latitude = coords.latitude;
			this.longitude = coords.longitude;
		});
	}
	
	scan() {
		this._pokemonService.get(this.latitude, this.longitude)
			.then(pokemon => this.processNewPokemon(pokemon))
			.catch(err => this.handleError(err || 'Failed to retrieve a response from PokeVision.com. PokeVision may be down for maintenance.'));
	}
	
	processNewPokemon(pokemon) {
		if(pokemon.length)
			this.handleError(''); //success, clear errors;
		else if (pokemon === 'throttle') {
			this.handleError('Requests are being throttled by Pokevision.com. Try scanning again later.');
		} 
		else {
			this.handleError('No pokemon found. PokeVision is either down or your location has no nearby Pokemon.');
		}
			
		
		var newMons = {};
		pokemon.forEach(p => {
			if(!this._pokeCache[p.id] && this.isInRangeAndNotIgnored(p)) {
				this.notify(p);
			}
			newMons[p.id] = true;
		});

		this._pokeCache = newMons;
	}
	
	notify(pokemon) {
		var t = Helpers.getTimeRemaining(pokemon.expiration_time);
		var name = this._pokemonService.getName(pokemon.pokemonId);
		var title = `A wild ${name} has appeared!`;
		var message = `Location: ${this.getDistance(pokemon)} meters ${this.getDirection(pokemon)}. \nTime until despawn ${t.m}:${t.s}`;
		var iconUrl = this._pokemonService.getSpriteUrl(pokemon.pokemonId);
			
		this._pokemonNotifications[pokemon.id] = pokemon;
		this._chromeService.createNotification(pokemon.id, title, message, iconUrl, [{
			title: `Click here to ignore ${name}s from now on`
		}]);
	}
	
	isInRangeAndNotIgnored(pokemon) {
		return (this.getDistance(pokemon) <= this.radiusMeters) && !this.pokemonToIgnore[pokemon.pokemonId]; 
	}
	
	getDistance(pokemon) {
		return Math.round(Helpers.calcCrow(this.latitude, this.longitude, parseFloat(pokemon.latitude), parseFloat(pokemon.longitude))*1000);
	}
	
	getDirection(pokemon) {
		return Helpers.getDirection(this.latitude, this.longitude, parseFloat(pokemon.latitude), parseFloat(pokemon.longitude));
	}
	
	handleError(err) {
		if (typeof err === 'object') {
			err = 'The scan request took too long. The servers may be overloaded.';
		}
		
		this.error = err;
		this._chromeService.reportError(err);
	}
}