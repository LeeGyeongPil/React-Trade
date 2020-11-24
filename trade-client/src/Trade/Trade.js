import React, { Component } from 'react';
import TradeBar from './TradeBar';

class Trade extends Component {
	constructor(props) {
		super(props);
		this.state = {
			coins : []
		};
	}

	componentDidMount() {
		this.props.socket.on('flush', (obj) => {
			this.setState({
				coins : obj
			});
		});
	}

	render() {
		const tradeBarComponent = data => {
			var keysort = Object.keys(data).sort(function(a,b) { return parseInt(b) - parseInt(a); });
			return keysort.map((key, i) => {
				return (<TradeBar coin={data[key]} key={i} />);
			});
		};
		return (
			<div className="trade-wrap">
				<div className="trade-board">
					{tradeBarComponent(this.state.coins)}
				</div>
			</div>
		);
	}
}

export default Trade;