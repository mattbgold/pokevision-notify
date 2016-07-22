scanning = false;
latitude = 33.774434268927;
longitude = -84.384722855175;
radiusMeters = 200;

  
  navigator.geolocation.getCurrentPosition(function(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  });
  

chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* Verify the message's format */
    //(msg.pokemonId !== undefined) || return;
	if(msg.start) {
		latitude = parseFloat(msg.latitude);
		longitude = parseFloat(msg.longitude);
		radiusMeters = parseInt(msg.radius);
	
		sweetSweetMons = {initialized: true};
	
		scanApi(msg.latitude, msg.longitude);
		scanInterval = setInterval(scanApi, 30000);
		scanning = true;
	}
	else if(msg.pokevision){
		console.log('open in pokevision');
		var url = 'https://pokevision.com/#/@' + latitude + ',' + longitude;
		chrome.tabs.create({ url: url });
	}
	else {
		scanning = false;
		clearInterval(scanInterval);
	}
	
});



function scanApi() {	
	$.get('https://pokevision.com/map/data/'+latitude+'/'+longitude)
		.done(data => {
			processNewPokemon(data.pokemon);
		});
}

function processNewPokemon(pokemon) {
	var newMons = {initialized: true};
	pokemon.forEach(p => {
		if(sweetSweetMons['initialized'] && !sweetSweetMons[p.id] && inRange(p)) {
			notifyMe(p);
		}
		newMons[p.id] = true;
	});

	sweetSweetMons = newMons;
}


function notifyMe(pokemon) {
	var t = getTimeRemaining(pokemon);
	var opt = {
	   type: "basic",
	   title: 'A wild '+names[pokemon.pokemonId]+' has appeared!',
	   message: "Distance: " + Math.round(getDistance(pokemon)) + " meters. Time remaining: " + t.m + ":" +t.s,
	   iconUrl: "http://ugc.pokevision.com/images/pokemon/"+pokemon.pokemonId+".png"
	};
	chrome.notifications.create("", opt, function(id) {
	   if(chrome.runtime.lastError) {
		 console.error(chrome.runtime.lastError.message);
	   }
	});
}


//---- Helper functions ----


function getTimeRemaining(pokemon) {
	var seconds =  Math.round((pokemon.expiration_time - (new Date().getTime()/1000)));
	return {
		m: Math.floor(seconds/60),
		s: seconds % 60 < 10 ? '0'+(seconds % 60).toString() : (seconds % 60).toString()
	};
}

//gps calulations
function inRange(pokemon) {
	return getDistance(pokemon) < radiusMeters; 
}
function getDistance(pokemon) {
	return calcCrow(latitude, longitude, parseFloat(pokemon.latitude), parseFloat(pokemon.longitude))*1000;
}
function calcCrow(lat1, lon1, lat2, lon2) 
    {
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

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }


	//pokemon names lookup
names = ["MissingNo!?", "Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran-f","Nidorina","Nidoqueen","Nidoran-m","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetchd","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr-mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"];