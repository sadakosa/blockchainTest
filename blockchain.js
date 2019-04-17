const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}

	// need to sign transactions and need to check whether the signature is valid

	calculateHash() {
		return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
	}

	signTransaction(signingKey) {
		if(signingKey.getPublic('hex') !== this.fromAddress) {
			throw new Error('You cannot sign transactions from other wallets!');
		}

		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx, 'base64'); //creating signature
		this.signature = sig.toDER('hex'); //storing signature
	}

	isValid() {
		if(this.fromAddress === null) return true; // if transaction fromAddress is null, that means it is reward to miner

		if(!this.signature || this.signature.length === 0) { // to check if they included the signature
			throw new Error("No signature in this transaction!");
		}

		const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);
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

	hasValidTransactions() { // check if all the transactions in block are valid
		for(const tx of this.transactions) {
			if(!tx.isValid) {
				return false;
			}
		}

		return true;
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

	addTransaction(transaction) {
		if(!transaction.fromAddress || !transaction.toAddress) {
			throw new Error('Transaction must include from and to address');
		}

		if(!transaction.isValid()) {
			throw new Error('Cannot add invalid transaction to chain');
		}

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

	isChainValid() { // verifies that all the blocks are linked and all the transactions are valid
		for(let i=1; i< this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i-1];

			if(!currentBlock.hasValidTransactions()) {
				return false;
			}

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

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;