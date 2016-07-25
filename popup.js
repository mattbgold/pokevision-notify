
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

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message.error) {
		$('#error').text(message.error).show();
	} else {
		$('#error').hide();
	}
});