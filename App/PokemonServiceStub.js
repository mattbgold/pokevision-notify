class PokemonServiceStub {
	constructor(code) {
		this.code = code;
	}
	
	getName() {
		return 'Bulbasaur';
	}
	
	getSpriteUrl() {
		return `http://ugc.pokevision.com/images/pokemon/1.png`;
	}
	
	getPokevisionUrl(lat, lon) {
		return 'https://pokevision.com/';
	}
	
	get(latitude, longitude) {
		return new Promise((resolve, reject) => {
			reject(this.code);
		});
	}
}