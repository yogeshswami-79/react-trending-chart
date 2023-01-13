import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.scss';
import { TVChartContainer } from './components/TVChartContainer/index';
import Widget from './components/CustomWidget/Widget';

function App() {

	useEffect(() => {
		const socket = io('http://localhost:4040');

		setTimeout(() => {
			socket.emit("subscribe", { stock: "tsla" });
		}, 5000)

		// socket.on('data', (data) => console.log(data));

		
	}, [])


	return (
		<div className={'App'}>
			<section id="graph">
				<TVChartContainer />
			</section>
			{/* <Widget /> */}

		</div>
	);
}


export default App;
