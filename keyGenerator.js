// This file is to generate private and public key

const EC = require('elliptic').ec;
// this library also allows u to sign smt and to check a signature

const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Public Key: ', publicKey);


console.log();
console.log('Private Key: ', privateKey);