
$(function(){
	var pokemonAreIgnored = false;
	
	chrome.runtime.getBackgroundPage(function (bp) {
		$('#txtLat').val(bp.App.latitude);
		$('#txtLon').val(bp.App.longitude);
		$('#txtMeters').val(bp.App.radiusMeters);
		
		if(bp.App.error) 
		    $('#error').text(bp.App.error).show();
		else
			$('#error').hide();
		
		if(Object.keys(bp.App.pokemonToIgnore).length) {
			pokemonAreIgnored = true;
		}
		
		if(bp.App.isScanning) {
			$('#beginScan').hide();
			$('.scan-in-progress').show();
			if(!pokemonAreIgnored) {
				$('#resetIgnore').hide();
			}
			else {
				$('#resetIgnore').show();
			}
		}
		else {
			$('#beginScan').show();
			$('.scan-in-progress').hide();
			$('#resetIgnore').hide();
		}
		
		appendNearbyPokemon(bp.App.pokeCache);
	});
	//get stae from background and initialize buttons
	
  $('#beginScan').click(function() {
	$(this).hide();
	if(pokemonAreIgnored) {
		$('#resetIgnore').show();
	}
	$('.scan-in-progress').show();
	
	toggleScan(true);
  });
  
  $('#stopScan').click(function() {
	  $(this).hide();
	  $('#beginScan').show();
	  $('.scan-in-progress').hide();
	  $('#resetIgnore').hide();
	  
	  toggleScan(false);
  });
  
  $('#resetIgnore').click(resetIgnore);
  
  $('#lnkOpen').click(openPokevision);
  
  $('#lnkLocation').click(() => {	
		$('#lnkLocation').hide();
		$('#latlon').show();
  });
  
  $('.param').keyup(function(){
	$('#stopScan').click();
  });
});




function toggleScan(start) {
	chrome.runtime.sendMessage({
		start: (start ? {
			latitude: parseFloat($('#txtLat').val()),
			longitude: parseFloat($('#txtLon').val()),
			radius: parseInt($('#txtMeters').val())
		} : false),
		stop: !start,
	}, function(){});
}

function openPokevision() {
	chrome.runtime.sendMessage({
		pokevision: true
	}, function(){});

}

function resetIgnore() {
	$('#resetIgnore').hide();
	chrome.runtime.sendMessage({
		resetIgnore: true
	}, function(){});
}

var chromeService = new ChromeService();
chromeService.addListener('error', (err) => {
	if(err) {
		$('#error').text(err).show();
	} else {
		$('#error').hide();
	}
});

chromeService.addListener('nearbyPokemon', pokemon => {
	console.log(pokemon);
	appendNearbyPokemon(pokemon);
});

function appendNearbyPokemon(pokemon) {
	$('.nearby-pokemon-list').empty();
	var show = false;
	for(var id in pokemon) {
		show = true;
		$('.nearby-pokemon-list').append(`<img src="http://ugc.pokevision.com/images/pokemon/${pokemon[id]}.png"/>`);
	}
	if(show) 
		$('.nearby-pokemon').slideDown();
	else {
		$('.nearby-pokemon').hide();
	}
}
