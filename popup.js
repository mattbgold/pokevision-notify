scanInterval = null;

$(function(){
	chrome.runtime.getBackgroundPage(function (bp) {
		$('#txtLat').val(bp.latitude);
		$('#txtLon').val(bp.longitude);
		$('#txtMeters').val(bp.radiusMeters);
		
		$('#beginScan').prop('disabled', bp.scanning);
		$('#stopScan').prop('disabled', !bp.scanning);

	});
	//get stae from background and initialize buttons
	
  $('#beginScan').click(function() {
	$(this).prop('disabled', true);
	$('#stopScan').prop('disabled', false);
	
	toggleScan(true);
  });
  
  $('#stopScan').click(function() {
	  $(this).prop('disabled', true);
	  $('#beginScan').prop('disabled', false);
	  
	  toggleScan();
  });
  
  $('#lnkOpen').click(openPokevision);
  
});




function toggleScan(start) {
	chrome.runtime.sendMessage({
		start: start,
		latitude: $('#txtLat').val(),
		longitude: $('#txtLon').val(),
		radius: $('#txtMeters').val()
	}, function(){});
}

function openPokevision() {
	chrome.runtime.sendMessage({
		pokevision: true
	}, function(){});

}