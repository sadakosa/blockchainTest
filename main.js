const SHA256 = require('crypto-js/sha256');

class Block {
	constructor(index, timestamp, data, previousHash = '') {
		this.index = index;
		this.timestamp = timestamp;
		this.data = data;
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
		this.difficulty = 4;
	}

	createGenesisBlock() {
		return new Block (0, '01/01/2017', "Genesis Block", "0");
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	addBlock(newBlock) {
		newBlock.previousHash = this.getLatestBlock().hash;
		newBlock.mineBlock(this.difficulty);
		this.chain.push(newBlock);
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


let sabsCoin = new Blockchain();

console.log('Mining Block 1...')
sabsCoin.addBlock(new Block (1, "10/07/2017", { amount: 4 }));

console.log('Mining Block 2...')
sabsCoin.addBlock(new Block (2, "12/07/2017", { amount: 4 }));

console.log('Mining Block 3...')
sabsCoin.addBlock(new Block (3, "15/07/2017", { amount: 4 }));









//*************************************************************/
//	testing to prevent tempering with "chain" part ofblockchain
//*************************************************************/

//console.log(JSON.stringify(sabsCoin, null, 4));
console.log('is Blockchain valid? ' + sabsCoin.isChainValid());

sabsCoin.chain[1].data = { amount: 100 }; 
sabsCoin.chain[1].hash = sabsCoin.chain[1].calculateHash();

console.log('is Blockchain valid? ' + sabsCoin.isChainValid());