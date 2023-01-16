import { io } from "socket.io-client";
import { parseFullSymbol } from "../helpers/helpers";

const channelToSubscription = new Map();

function initSockets(url) {
	const socket = io(url);

	socket.on('connect', () => {
		console.log('connected')
	});

	socket.on('disconnect', (reason) => {
		console.log('[socket] Disconnected:', reason);
	});

	socket.on('error', (error) => {
		console.log('[socket] Error:', error);
	});

	socket.on('data', data=>{
		// console.log(data);
		const callback = channelToSubscription.get('handler');
		if(!callback) return;
		// console.log(data);
		callback(data)
	})

	return socket;
}


export default class {

	constructor() {
		this.socket = initSockets(`http://localhost:4040`);
		this.socket.emit('subscribe', {msg:'subscribe'})
	}

	subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback, lastDailyBar) {
		channelToSubscription.set('handler', onRealtimeCallback);
	}

	unsubscribeFromStream(subscriberUID) {

	}

}