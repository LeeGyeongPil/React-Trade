import React, { Component } from 'react';

class TradeBar extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		var classname = "coin-rect " + this.props.coin.type;
		return (
			<div className={classname} onClick={() => this.setPrice(this.props.coin.price)}>{this.props.coin.price}<label>{this.props.coin.count}</label></div>
		)
	}
	
	setPrice = (price) => {
		document.getElementById('trade_price').value = price;
		document.getElementById('trade_count').value = 0;
	}
}

export default TradeBar;