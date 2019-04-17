const SHA256 = require('crypto-js/sha256');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}





class Block {
	constructor(timestamp, transactions, previousHash = '') {
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
		this.nonce = 0;
	}

	calculateHash() {
		return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
	}

	mineBlock(difficulty) { //to implement proof of work
		//make the computer brute force guess how many zeros should be at the top of the hash
		//Question: how do they know that this can be calculated easily??? How do they know that SHA256 will give back 0000 in the front????
		while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
			this.nonce ++;
			this.hash = this.calculateHash();
		} 

		console.log("Block mined: " + this.hash);
	}
}





class Blockchain{
	constructor() {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	createGenesisBlock() {
		return new Block ('01/01/2017', "Genesis Block", "0");
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	addBlock(newBlock) { 
		newBlock.previousHash = this.getLatestBlock().hash; //linking the block tgt 
		newBlock.mineBlock(this.difficulty);
		this.chain.push(newBlock);
	}

	minePendingTransactions(miningRewardAddress) {
		let block = new Block(Date.now(), this.pendingTransactions);
		//usually, allocating the pending transactions to a miner is not that easy as there will be too many pending transactions to fit into an array. 
		//you will have to figure out the algo for how to allocate the pending transactions 
		block.mineBlock(this.difficulty);

		console.log('Block sucessfully mined!');
		block.previousHash = this.getLatestBlock().hash;
		this.chain.push(block);

		this.pendingTransactions = [
			new Transaction(null, miningRewardAddress, this.miningReward)
		]; //is it wrong to rewrite the whole array? there may have been additional pending transactions added in the mean time
	}

	createTransaction(transaction) {
		this.pendingTransactions.push(transaction);
	}

	getBalancedAddress(address) {
		let balance = 0;

		for(const block of this.chain) {
			for(const trans of block.transactions) {
				if(trans.fromAddress === address) {
					balance -= trans.amount;
				}

				if(trans.toAddress === address) {
					balance += trans.amount;
				}
			}
		}

		return balance;
	}

	isChainValid() {
		for(let i=1; i< this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i-1];

			if(currentBlock.hash !== currentBlock.calculateHash()){
				return false;
			}

			if(currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}

		return true;
	}
}
//*******************************************************/
//				   To convert to bitcoin
//*******************************************************/
// 1) create transactions class
// 2) in Blockchain Class, add mining reward
// 3) in Blockchain Class, store pending transactions
// 4) in Blockchain Class, method to mine a new block for pending transactions


let sabsCoin = new Blockchain();


sabsCoin.createTransaction(new Transaction('address1', 'address2', 100));
sabsCoin.createTransaction(new Transaction('address2', 'address1', 100));


// mined current transactions and added a transaction that directs 100 coins to 'minersAddress' that is pending
console.log('\n Starting the miner...');
sabsCoin.minePendingTransactions('minersAddress');

console.log('\n Balance of miner is ', sabsCoin.getBalancedAddress('minersAddress'));


// mined current transactions thus, miner's balance = 100
// also added a transaction that directs 100 coins to 'minersAddress' that is pending
console.log('\n Starting the miner...');
sabsCoin.minePendingTransactions('minersAddress');

console.log('\n Balance of miner is ', sabsCoin.getBalancedAddress('minersAddress'));
