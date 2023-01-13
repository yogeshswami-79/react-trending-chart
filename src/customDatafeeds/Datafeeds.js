import { makeApiRequest, generateSymbol, parseFullSymbol } from '../helpers/helpers.js';
import ConfigData from "./ConfigData.js";
import Streaming from "../streaming/streaming.js";

export default class {

    constructor() {
        this.configurationData = ConfigData;
        this.Streaming = new Streaming();
        this.lastBarsCache = new Map();
    }
    

    async getAllSymbols() {
        let allSymbols = [];
        const data = await makeApiRequest('data/v3/all/exchanges');

        for (const exchange of this.configurationData.exchanges) {
            const pairs = data.Data[exchange.value].pairs;

            for (const leftPairPart of Object.keys(pairs)) {
                const symbols = pairs[leftPairPart].map(rightPairPart => {
                    const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
                    return {
                        symbol: symbol.short,
                        full_name: symbol.full,
                        description: symbol.short,
                        exchange: exchange.value,
                        type: 'crypto',
                    };
                });
                allSymbols = [...allSymbols, ...symbols];
            }
        }
        return allSymbols;
    }

    onReady(callback) {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(this.configurationData))
    }

    searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
        console.log('[searchSymbols]: Method call');
    }

    async resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
        console.log('[resolveSymbol]: Method call', symbolName);
        const symbols = await this.getAllSymbols();
        const symbolItem = symbols.find(({ full_name }) => full_name === symbolName);

        if (!symbolItem) {
            console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
            onResolveErrorCallback('cannot resolve symbol');
            return;
        }

        const symbolInfo = {
            ticker: symbolItem.full_name,
            name: symbolItem.symbol,
            description: symbolItem.description,
            type: symbolItem.type,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: symbolItem.exchange,
            minmov: 1,
            pricescale: 100,
            has_intraday: true,
            has_no_volume: true,
            has_weekly_and_monthly: false,
            supported_resolutions: this.configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };

        console.log('[resolveSymbol]: Symbol resolved', symbolName);
        onSymbolResolvedCallback(symbolInfo);
    }

    async getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
        const { from, to, firstDataRequest } = periodParams;
        console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
        const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
        const urlParameters = {
            e: parsedSymbol.exchange,
            fsym: parsedSymbol.fromSymbol,
            tsym: parsedSymbol.toSymbol,
            toTs: to,
            limit: 2000,
        };
        const query = Object.keys(urlParameters)
            .map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
            .join('&');
        try {
            const data = await makeApiRequest(`data/histoday?${query}`);
            if (data.Response && data.Response === 'Error' || data.Data.length === 0) {
                // "noData" should be set if there is no data in the requested period.
                onHistoryCallback([], { noData: true });
                return;
            }
            let bars = [];
            data.Data.forEach(bar => {
                if (bar.time >= from && bar.time < to) {
                    bars = [...bars, {
                        time: bar.time * 1000,
                        low: bar.low,
                        high: bar.high,
                        open: bar.open,
                        close: bar.close,
                    }];
                }
            });
            console.log(`[getBars]: returned ${bars.length} bar(s)`);
            onHistoryCallback(bars, { noData: false });
        } catch (error) {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error);
        }

    }

    subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
        console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        this.Streaming.subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            onResetCacheNeededCallback,
            this.lastBarsCache.get(symbolInfo.full_name)
        );
    }

    unsubscribeBars(subscriberUID) {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        this.Streaming.unsubscribeFromStream(subscriberUID);
    }

}