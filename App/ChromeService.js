class ChromeService {
	addListener(msgType, handler) {
		chrome.runtime.onMessage.addListener((msg) => {
			if(msg[msgType]) {
				handler(msg[msgType]);
			}
		});
	}
	
	reportError(err) {
		chrome.runtime.sendMessage({error: err});	
	}
	
	createNotification(notificationId, title, message, iconUrl, buttons) {
		var opt = {
		    type: "basic",
		    title: title,
			message: message,
			iconUrl: iconUrl,
			buttons: buttons
		};
		chrome.notifications.create(notificationId.toString(), opt, (id) => {
		   if(chrome.runtime.lastError) {
			 console.error(chrome.runtime.lastError.message);
		   }
		});
	}
	
	clearNotification(notificationId) {
		chrome.notifications.clear(notificationId.toString());
	}
	
	addNotificationListener(callback) {
		chrome.notifications.onButtonClicked.addListener(callback);
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
	
	storageSet(key, val) {
		var obj = {};
		obj[key] = val;
		chrome.storage.sync.set(obj, function(){});
	}
	
	storageGet(key, callback) {
		return chrome.storage.sync.get(key, (result) => callback(result[key]));
	}
}