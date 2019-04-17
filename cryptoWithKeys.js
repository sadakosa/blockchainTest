const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const myKey = ec.keyFromPrivate('4bd43c09626da5e99dcbb563c37330f66fc7449de41ba799057c8b2b929d5a58');
const myWalletAddress = myKey.getPublic('hex');



let sabsCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
sabsCoin.addTransaction(tx1);

// mined current transactions and added a transaction that directs 100 coins to 'minersAddress' that is pending
console.log('\n Starting the miner...');
sabsCoin.minePendingTransactions(myWalletAddress);

console.log('\n Balance of miner is ', sabsCoin.getBalancedAddress('minersAddress'));


// mined current transactions thus, miner's balance = 100
// also added a transaction that directs 100 coins to 'minersAddress' that is pending
console.log('\n Starting the miner...');
sabsCoin.minePendingTransactions('minersAddress');

console.log('\n Balance of miner is ', sabsCoin.getBalancedAddress(myWalletAddress));
