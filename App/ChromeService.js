class ChromeService {
	addListener(msgType, handler) {
		chrome.runtime.onMessage.addListener((msg) => {
			if(msg[msgType]) {
				handler(msg[msgType]);
			}
		});
	}
	
	reportError(err) {
		if(typeof err === 'number') {
			chrome.runtime.sendMessage({error: err});
			return err;
		}
		else {
			console.error(err);
			return 1;
		}	
	}
	
	createNotification(title, message, iconUrl) {
		var opt = {
		    type: "basic",
		    title: title,
			message: message,
			iconUrl: iconUrl
		};
		chrome.notifications.create("", opt, (id) => {
		   if(chrome.runtime.lastError) {
			 console.error(chrome.runtime.lastError.message);
		   }
		});
	}
	
	getGeolocation() {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition((position) => {
				resolve({
					latitude: position.coords.latitude, 
					longitude: position.coords.longitude
				});
			});
		});
	}
	
	openTab(url) {
		chrome.tabs.create({ url: url });
	}
}