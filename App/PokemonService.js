class PokemonService {
	constructor() {
		this._names = ["MissingNo!?", "Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran-f","Nidorina","Nidoqueen","Nidoran-m","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetchd","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr-mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"];
	}
	
	getName(pokemonId) {
		return this._names[pokemonId];
	}
	
	getSpriteUrl(pokemonId) {
		return `http://ugc.pokevision.com/images/pokemon/${pokemonId}.png`;
	}
	
	getPokevisionUrl(lat, lon) {
		return `https://pokevision.com/#/@${lat},${lon}`;
	}
	
	get(latitude, longitude) {
		return this._scan(latitude, longitude)
			.then(jobId => {
				return Helpers.delay(3000).then(() => 
					Helpers.runFunctionWithRetriesAndMaxTimeout(() => 
						this._getPokemon(latitude, longitude, jobId), 3000 /* start at 3s per try */, 1000 /* inc by 1s */, 10000 /* max 10s */));
			});
	}
	
	_scan(latitude, longitude) {
		return new Promise((resolve, reject) => {
			$.get(`https://pokevision.com/map/scan/${latitude}/${longitude}`)
				.done(result => {
					if(typeof result === "string") {
						return reject();
					}
					
					resolve(result.jobId);
				}).fail(() => reject());
		});
	}
	
	_getPokemon(latitude, longitude, jobId) {
		var url = `https://pokevision.com/map/data/${latitude}/${longitude}`;
		
		if(jobId) {
			url += '/' + jobId;
		}
		
		return new Promise((resolve, reject) => {
			$.get(url).done(result => {
				if(result.status === 'success') {
					if(result.jobStatus === 'in_progress') {
						return reject();
					}
					resolve(result.pokemon);
				}
				else if (result.message === '{scan-throttle}') {
					resolve('throttle');
				}
				else
					reject();
				
			}).fail(() => reject());
		});
	}
}