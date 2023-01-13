import React, { useEffect, useState , createRef } from 'react';
import './index.scss';
import { widget } from '../../charting_library';
import Datafeed from '../../customDatafeeds/Datafeeds.js'

function getLanguageFromURL() {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export function TVChartContainer() {

	const ref = createRef();
	const [tvWidget, setTvWidget] = useState(null);
	const [defaultProps, setDefaultProps] = useState({
		symbol: 'AAPL',
		interval: 'D',
		datafeedUrl: 'https://demo_feed.tradingview.com',
		libraryPath: '/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',

		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: true,
		autosize: false,
		studiesOverrides: {},
	})


	useEffect(() => {

		const temp = {
			symbol: 'Bitfinex:BTC/USD',
			interval: '1D',
			fullscreen: true,
			container: 'tv_chart_container',
			datafeed: new Datafeed(),
			library_path: '../charting_library_cloned_data/charting_library/',
		}

		setTvWidget(() => new widget({
			symbol: 'Bitfinex:BTC/USD',
			interval: '1D',
			timezone: "America/New_York",
			container: "tv_chart_container",
			locale: "en",
			datafeed: new Datafeed(),
			// datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
			library_path: "charting_library/"
		}))
	}, [])


	useEffect(() => {
		return (() => {
			if (tvWidget !== null) {
				tvWidget.remove();
				setTvWidget(() => null);
			}
		})

	}, [])

	//------------------------------------------------------------ Render

	return (
		<div ref={ref} className={'TVChartContainer'} id="tv_chart_container" />
	);
}
