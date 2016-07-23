class App {
	constructor(pokemonService, chromeService) {
		this._pokemonService = pokemonService;
		this._chromeService = chromeService;
		
		this.pokeCache = {};
		
		this.isScanning = false;
		this.scanInterval = null;
		
		this.latitude = 33.774434268927;
		this.longitude = -84.384722855175;
		this.radiusMeters = 200;
		
		this.error = 0;
		
		
		this._chromeService.addListener('start', data => {
			this.latitude = data.latitude;
			this.longitude = data.longitude;
			this.radiusMeters = data.radius;
		
			this.isScanning = true;
			this.pokeCache = {};
			
			this.scanInterval = setInterval(() => this.scan(), 30000);
			this.scan();
		});
		
		this._chromeService.addListener('stop', () => {
			this.isScanning = false;
			this.pokeCache = {};
			
			clearInterval(this.scanInterval);
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
			.catch(err => this.handleError(err));
	}
	
	processNewPokemon(pokemon) {
		this.handleError(0); //success, clear errors;
		
		var newMons = {};
		pokemon.forEach(p => {
			if(!this.pokeCache[p.id] && this.inRange(p)) {
				this.notify(p);
			}
			newMons[p.id] = true;
		});

		this.pokeCache = newMons;
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
		this.error = this._chromeService.reportError(err);
	}
}