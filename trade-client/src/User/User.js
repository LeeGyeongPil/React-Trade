import React, { Component } from 'react';

class User extends Component {
	constructor(props) {
		super(props);
		this.sessionId = this.setId();
		this.state = {
			money : 10000,
			coin : 0,
			excoin : 0,
		};
	}

	componentDidMount() {
		this.props.socket.on('trade-success', (obj) => {
			this.setState({
				money : this.state.money + parseInt(obj.money),
				coin : this.state.coin + parseInt(obj.coin),
			});
			if (parseInt(obj.coin) < 0){
				this.setState({
					excoin : this.state.excoin - parseInt(obj.coin),
				});
			}
		});
	}

	setId() {
		return btoa('session' + (Math.random() * new Date().getTime()));
	}

	render() {
		return (
			<div id="user-panel">
				<div>ID : {this.sessionId}</div>
				<div>Money : {this.state.money}</div>
				<div>Coin : {this.state.coin}</div>
				<div>ExCoin : {this.state.excoin}</div>
				<input type="text" id="trade_price" readOnly={false} />
				<input type="text" id="trade_count" readOnly={false} />
				<button onClick={() => this.trader('buy')}>구매</button>
				<button onClick={() => this.trader('sell')}>판매</button>
			</div>
		);
	}

	trader(type) {
		if (document.getElementById('trade_price').value === '') {
			alert('가격을 선택하세요.');
			return false;
		}
		if (parseInt(document.getElementById('trade_count').value) === 0) {
			alert('수량을 입력하세요.');
			return false;
		}
		if (type === 'buy') {
			if (parseInt(document.getElementById('trade_price').value) * parseInt(document.getElementById('trade_count').value) > this.state.money) {
				alert('금액을 초과할 수 없습니다.');
				return false;
			}
			this.setState({
				money : this.state.money - parseInt(document.getElementById('trade_price').value) * parseInt(document.getElementById('trade_count').value),
			});
		}
		if (type === 'sell') {
			if (parseInt(document.getElementById('trade_count').value) > this.state.coin + this.state.excoin) {
				alert('판매수량이 가진 수량보다 초과할 수 없습니다.');
				return false;
			}
			this.setState({
				excoin : this.state.excoin - parseInt(document.getElementById('trade_count').value)
			});
		}
		this.props.socket.emit('trade', { id : this.props.socket.id, price : document.getElementById('trade_price').value, count : document.getElementById('trade_count').value, type : type });
	}
}

export default User;