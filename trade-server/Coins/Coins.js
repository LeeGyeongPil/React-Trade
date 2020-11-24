module.exports = class Coins {
	constructor(io) {
		this.state = {
			coins : {
				160 : {price : 160, count : 5000, type : 'sell', reserver : [['bot',5000]] },
				150 : {price : 150, count : 5000, type : 'sell', reserver : [['bot',5000]] },
				140 : {price : 140, count : 5000, type : 'sell', reserver : [['bot',5000]] },
				130 : {price : 130, count : 5000, type : 'sell', reserver : [['bot',5000]] },
				120 : {price : 120, count : 5000, type : 'sell', reserver : [['bot',5000]] },
				110 : {price : 110, count : 5000, type : 'buy', reserver : [['bot',5000]] },
				100 : {price : 100, count : 5000, type : 'buy', reserver : [['bot',5000]] },
				70 : {price : 70, count : 5000, type : 'buy', reserver : [['bot',5000]] },
				80 : {price : 80, count : 5000, type : 'buy', reserver : [['bot',5000]] },
				90 : {price : 90, count : 5000, type : 'buy', reserver : [['bot',5000]] },
			}
		};
		this.bot();
		this.io = io;
		this.totalch = 0;
		this.totaltax = 0;
	};

	arrayRange = (start, stop, step) => {
		var a = [start], b = start;
		while (b < stop) {
			a.push(b += step || 1);
		}
		return a;
	}

	bot = () => {
		var bottype = Math.round(Math.random() * 100);
		var rand = Math.round(Math.random() * 500);
		var key = 0;
		var types = (Math.round(Math.random()) ? 'buy' : 'sell');
		var minsell = parseInt(Object.keys(this.state.coins).filter((key) => { return this.state.coins[key].type === 'sell'; }).sort(function(a,b) { return parseInt(a) - parseInt(b); })[0]);
		var maxbuy = parseInt(Object.keys(this.state.coins).filter((key) => { return this.state.coins[key].type === 'buy'; }).sort(function(a,b) { return parseInt(b) - parseInt(a); })[0]);
		var counts = 10;
		if (bottype < 80) {
			if (Math.round(Math.random() * 100) < 20) {
				if (types == 'buy') {
					if (maxbuy < 20) maxbuy = 20;
					maxbuy = maxbuy - 10;
				} else {
					minsell = minsell + 10;
				}
			}
			key = this.arrayRange(maxbuy,minsell,10);
			counts = Math.floor(Math.random() * 500);
		} else if (bottype < 95) {
			if (maxbuy < 110) maxbuy = 110;
			key = this.arrayRange(maxbuy - 100,minsell + 100,10);
			counts = Math.floor(Math.random() * 2000);
		} else {
			if (maxbuy < 110) maxbuy = 110;
			key = this.arrayRange(maxbuy - 100,minsell + 100,10);
			counts = Math.floor(Math.random() * 10000);
		}
		setTimeout(() => {
			var exch = { id : 'bot', price : key[Math.floor(Math.random() * key.length)], count : counts, type : types};
			this.io.emit('flush', this.trade(exch));
			this.bot();
		},rand);
	};
	
	autobot = () => {
		const key = Object.keys(this.state.coins);
	}

	get = () => {
		/*
		var minsell = parseInt(Object.keys(this.state.coins).filter((key) => { return this.state.coins[key].type === 'sell'; }).sort(function(a,b) { return parseInt(a) - parseInt(b); })[0]);
		var maxbuy = parseInt(Object.keys(this.state.coins).filter((key) => { return this.state.coins[key].type === 'buy'; }).sort(function(a,b) { return parseInt(b) - parseInt(a); })[0]);
		if (maxbuy < 50) maxbuy = 50;
		var key = this.arrayRange(maxbuy - 40,minsell + 40,10);
		var coinObject = new Object();
		key.filter((k) => { if (this.state.coins[k]) coinObject[k] = this.state.coins[k]; });
		return coinObject;
		//*/
		return this.state.coins;
	};

	tradeMsg = (id_response,id_request,money,count,type) => {
		this.totalch += parseInt(money) * parseInt(count);
		var vmoney = parseInt(money * 0.05);
		var tmoney = parseInt(money) - vmoney;
		this.totaltax += vmoney * parseInt(count);
		if (type === 'buy') {
			if (id_request != 'bot') this.io.to(id_request).emit('trade-success', { coin : parseInt(count), money : 0});
			if (id_response != 'bot') this.io.to(id_response).emit('trade-success', { coin : -1 * parseInt(count), money : tmoney * parseInt(count)});
		} else if (type === 'sell') {
			if (id_request != 'bot') this.io.to(id_request).emit('trade-success', { coin : -1 * parseInt(count), money : tmoney * parseInt(count)});
			if (id_response != 'bot') this.io.to(id_response).emit('trade-success', { coin : parseInt(count), money : 0});
		}
	};

	trade = (exec) => {
		if (this.state.coins[exec.price] === undefined || exec.type !== this.state.coins[exec.price].type) {
			if (exec.type === 'buy') {
				var keysort = Object.keys(this.state.coins).sort(function(a,b) { return parseInt(a) - parseInt(b); });
			} else if (exec.type === 'sell') {
				var keysort = Object.keys(this.state.coins).sort(function(a,b) { return parseInt(b) - parseInt(a); });
			}
			keysort.map((key, i) => {
				var chk = false;
				if (exec.type === 'buy') {
					if (exec.price >= this.state.coins[key].price && this.state.coins[key].type === 'sell') {
						chk = true;
					}
				} else if (exec.type === 'sell') {
					if (exec.price <= this.state.coins[key].price && this.state.coins[key].type === 'buy') {
						chk = true;
					}
				}
				if (chk) {
					if (parseInt(exec.count) > 0) {
						if (this.state.coins[key].count > parseInt(exec.count)) {
							var deleteidx = new Array();
							this.state.coins[key].reserver.forEach((v,i) => {
								if (parseInt(exec.count) > 0 && parseInt(exec.count) < parseInt(v[1])) {
									this.state.coins[key].reserver[i][1] = parseInt(this.state.coins[key].reserver[i][1]) - parseInt(exec.count);
									this.state.coins[key].count -= parseInt(exec.count);
									this.tradeMsg(v[0],exec.id,key,exec.count,exec.type);
									exec.count = 0;
								} else if (parseInt(exec.count) > parseInt(v[1])) {
									exec.count = parseInt(exec.count) - parseInt(v[1]);
									this.state.coins[key].count -= parseInt(v[1]);
									deleteidx.push(i);
									this.tradeMsg(v[0],exec.id,key,v[1],exec.type);
								} else if (parseInt(exec.count) > 0) {
									this.state.coins[key].count -= parseInt(v[1]);
									this.tradeMsg(v[0],exec.id,key,exec.count,exec.type);
									exec.count = 0;
									deleteidx.push(i);
								}
							});
							deleteidx.forEach((v,i) => {
								delete this.state.coins[key].reserver[i];
								this.state.coins[key].reserver = this.state.coins[key].reserver.filter(function(el) { return el; });
							});
						} else if (this.state.coins[key].count <= parseInt(exec.count)) {
							this.state.coins[key].reserver.forEach((v,i) => {
								exec.count = parseInt(exec.count) - parseInt(v[1]);
								this.state.coins[key].count -= parseInt(v[1]);
								this.tradeMsg(v[0],exec.id,key,v[1],exec.type);
							});
							delete this.state.coins[key];
						}
					}
				}
			});
			if (exec.count > 0) {
				this.state.coins[exec.price] = { price : parseInt(exec.price), count : parseInt(exec.count), type : exec.type, reserver : [[exec.id, parseInt(exec.count)]] };
			}
		} else if (exec.type === this.state.coins[exec.price].type) {
			this.state.coins[exec.price].count += parseInt(exec.count);
			this.state.coins[exec.price].reserver.push([exec.id, parseInt(exec.count)]);
		}
		return this.get();
	};
}