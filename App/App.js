class App {
	constructor(pokemonService, chromeService) {
		this._pokemonService = pokemonService;
		this._chromeService = chromeService;
		
		this._pokeCache = {};
		this._scanInterval = null;
		
		this.isScanning = false;
		this.latitude = 33.774434268927;
		this.longitude = -84.384722855175;
		this.radiusMeters = 500;
		
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
			
			clearInterval(this._scanInterval);
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
			if(!this._pokeCache[p.id] && this.inRange(p)) {
				this.notify(p);
			}
			newMons[p.id] = true;
		});

		this._pokeCache = newMons;
	}
	
	notify(pokemon) {
		var t = Helpers.getTimeRemaining(pokemon.expiration_time);
		var title = `A wild ${this._pokemonService.getName(pokemon.pokemonId)} has appeared!`;
		var message = `Location: ${this.getDistance(pokemon)} meters ${this.getDirection(pokemon)}. \nTime until despawn ${t.m}:${t.s}`;
		var iconUrl = this._pokemonService.getSpriteUrl(pokemon.pokemonId);
			
		this._chromeService.createNotification(title, message, iconUrl);
	}
	
	inRange(pokemon) {
		return this.getDistance(pokemon) <= this.radiusMeters; 
	}
	
	getDistance(pokemon) {
		return Math.round(Helpers.calcCrow(this.latitude, this.longitude, parseFloat(pokemon.latitude), parseFloat(pokemon.longitude))*1000);
	}
	
	getDirection(pokemon) {
		return Helpers.getDirection(this.latitude, this.longitude, parseFloat(pokemon.latitude), parseFloat(pokemon.longitude));
	}
	
	handleError(err) {
		this.error = err;
		this._chromeService.reportError(err);
	}
}