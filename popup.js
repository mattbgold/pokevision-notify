
$(function(){
	chrome.runtime.getBackgroundPage(function (bp) {
		$('#txtLat').val(bp.App.latitude);
		$('#txtLon').val(bp.App.longitude);
		$('#txtMeters').val(bp.App.radiusMeters);
		
		
		if(bp.App.error === 1)
		    $('#error').show();
		else
			$('#error').hide();
		
		if(bp.App.error === 2)
		    $('#error2').show();
		else
			$('#error2').hide();
		
		
		
		if(bp.App.isScanning) {
			$('#beginScan').hide();
			$('#stopScan').show();
			$('#checking').show();
		}
		else {
			$('#beginScan').show();
			$('#stopScan').hide();
			$('#checking').hide();
		}
	});
	//get stae from background and initialize buttons
	
  $('#beginScan').click(function() {
	$(this).hide();
	$('#stopScan').show();
	$('#checking').show();
	
	toggleScan(true);
  });
  
  $('#stopScan').click(function() {
	  $(this).hide();
	  $('#beginScan').show();
	  $('#checking').hide();
	  $('#error').hide();
	  
	  toggleScan(false);
  });
  
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

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.error) {
		case 1: 
			$('#error').show();
			$('#error2').hide();
			break;
		case 2: 
			$('#error2').show();
			$('#error').hide();
			break;
		default:		
			$('#error').hide();
			$('#error2').hide();
	}
});