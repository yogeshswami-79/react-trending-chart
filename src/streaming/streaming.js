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
		console.log(data);
		callback(data)
	})

	return socket;
}


export default class {

	constructor() {
		// const apiKey = "fad6a1c5a577afab20e8521fec972734d805bcc4432b2490793a3bb21f6f84d2";
		// this.socket = io(`wss://streamer.cryptocompare.com/v2&api_key=${apiKey}`);

		this.socket = initSockets(`http://localhost:4040`);
		this.socket.emit('subscribe', {msg:'ra'})
	}

	subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback, lastDailyBar) {
		// const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
		// const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
		// const handler = {
		// 	id: subscriberUID,
		// 	callback: onRealtimeCallback,
		// };
		// let subscriptionItem = channelToSubscription.get(channelString);
		
		// if (subscriptionItem) {
		// 	// already subscribed to the channel, use the existing subscription
		// 	subscriptionItem.handlers.push(handler);
		// 	return;
		// }

		// subscriptionItem = {
		// 	subscriberUID,
		// 	resolution,
		// 	lastDailyBar,
		// 	handlers: [handler],
		// };

		// channelToSubscription.set(channelString, subscriptionItem);
		// console.log('[subscribeBars]: Subscribe to streaming. Channel:', channelString);
		// this.socket.emit('SubAdd', { subs: [channelString] });
		channelToSubscription.set('handler', onRealtimeCallback);
	}

	unsubscribeFromStream(subscriberUID) {

	}

}