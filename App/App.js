class App {
	constructor(pokemonService, ioService) {
		this._pokemonService = pokemonService;
		this._ioService = ioService;
		
		this._scanInterval = null;
		this._pokemonNotifications = {};
		
		this.pokeCache = {};
		this.isScanning = false;
		this.latitude = 33.774434268927;
		this.longitude = -84.384722855175;
		this.radiusMeters = 500;
		this._ioService.storageGet('pokemonToIgnore', result =>  {
			this.pokemonToIgnore = result || {};
		});
		
		
		this.error = '';
		
		
		this._ioService.addListener('start', data => {
			this.latitude = data.latitude;
			this.longitude = data.longitude;
			this.radiusMeters = data.radius;
		
			this.isScanning = true;
			this.pokeCache = {};
			
			this._scanInterval = setInterval(() => this.scan(), 35000);
			this.scan();
		});
		
		this._ioService.addListener('stop', () => {
			this.isScanning = false;
			this.pokeCache = {};
			this.handleError(''); //clear errors
			
			clearInterval(this._scanInterval);
		});
		
		this._ioService.addNotificationListener((notificationId) => { //handle button click in notification
			this.pokemonToIgnore[this._pokemonNotifications[notificationId].pokemonId] = true;
			this._ioService.storageSet('pokemonToIgnore', this.pokemonToIgnore);
			this._ioService.clearNotification(notificationId);
		});
		
		this._ioService.addListener('resetIgnore', () => {
			this.pokemonToIgnore = {};
			this._ioService.storageSet('pokemonToIgnore', {});
		});
		
		this._ioService.addListener('pokevision', () => {
			this._ioService.openTab(this._pokemonService.getPokevisionUrl(this.latitude, this.longitude));
		});
		
		this._ioService.getGeolocation().then(coords => {
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
			if(this.isInRangeAndNotIgnored(p)) {
				if(!this.pokeCache[p.id])
					this.notify(p);
				newMons[p.id] = p.pokemonId;
			}
		});

		this.pokeCache = newMons;
		this._ioService.reportNearbyPokemon(this.pokeCache);
	}
	
	notify(pokemon) {
		var t = Helpers.getTimeRemaining(pokemon.expiration_time);
		var name = this._pokemonService.getName(pokemon.pokemonId);
		var title = `A wild ${name} has appeared!`;
		var message = `Location: ${this.getDistance(pokemon)} meters ${this.getDirection(pokemon)}. \nTime until despawn ${t.m}:${t.s}`;
		var iconUrl = this._pokemonService.getSpriteUrl(pokemon.pokemonId);
			
		this._pokemonNotifications[pokemon.id] = pokemon;
		this._ioService.createNotification(pokemon.id, title, message, iconUrl, [{
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
		this._ioService.reportError(err);
	}
}