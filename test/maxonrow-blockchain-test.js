'use strict'
const chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
require('dotenv').config()

// Configure chai
chai.should()
const expect = chai.expect
chai.use(chaiAsPromised)

require('dotenv').config()
const LorenaMaxonrow = require('../src/index.js')
const Utils = require('../src/utils/utils')
const Zen = require('@lorena-ssi/zenroom-lib')
const z = new Zen('sha256')

const nodeProvider = {
  connection: {
    url: process.env.EndpointUrl || 'localhost',
    timeout: 60000
  },
  trace: {
    silent: false,
    silentRpc: true
  },
  chainId: process.env.ChainId,
  name: 'mxw',
  kyc: { issuer: process.env.KycIssuer || 'dunno' },
  nonFungibleToken: {
    provider: process.env.ProviderWalletMnemonic || 'dunno',
    issuer: process.env.IssuerWalletMnemonic || 'dunno',
    middleware: process.env.MiddlewareWalletMnemonic || 'dunno',
    feeCollector: process.env.FeeCollectorWalletAddr || 'dunno'
  }
}

const generateDid = async (myString) => {
  const zhash = await z.hash(myString)
  console.log('zhash:', zhash)
  const did = zhash.hash.substr(0, 16)
  console.log('Did: ' + did)
  return did
}

const generatePublicKey = async (did) => {
  const kZpair = await z.newKeyPair(did)
  const pubKey = kZpair[did].keypair.public_key
  console.log('Public Key:', pubKey)
  return pubKey
}

describe('Maxonrow Blockchain Tests', function () {
  let maxBlockApi
  let symbol, did, pubKey, newPubKey, randomHash
  // Someone wallet that has been passed kyc
  const mnemonic = 'pill maple dutch predict bulk goddess nice left paper heart loan fresh'

  before('Lorena Maxonrow Test Preparation', async () => {
    symbol = 'LOR' + Utils.makeUniqueString(4)
    const didString = Utils.makeUniqueString(16)
    did = await generateDid(didString)
    pubKey = await generatePublicKey(did)
    newPubKey = await generatePublicKey(did)
    randomHash = Utils.makeUniqueString(16)
    maxBlockApi = new LorenaMaxonrow(symbol, mnemonic, nodeProvider)
    await maxBlockApi.connect()
  })

  it('Create Non Fungible Token', async () => {
    try {
      await maxBlockApi.createIdentityToken(symbol)
    } catch (err) {
      console.log('ERROR creating a new NFT Token!!!!!', err)
    }
  })

  it('Should create a Key NonFungibleTokenItem', async () => {
    const myKey = maxBlockApi.createKeyTokenItem(did, pubKey)
    console.log('My key is: ', myKey)
    expect(myKey).to.be.an('object')
    expect(myKey).to.have.any.keys(
      'symbol',
      'itemID',
      'properties',
      'metadata'
    )
    expect(myKey.symbol).to.eq(symbol)
    expect(myKey.itemID).to.eq(did)

    const jsonMetadata = JSON.parse(myKey.metadata)
    expect(jsonMetadata).to.be.an('object')
    expect(jsonMetadata).to.have.any.keys(
      'diddocHash'
    )
    expect(jsonMetadata.publicKeys).to.have.be.an('array')
    expect(jsonMetadata.publicKeys[0].key).to.eq(pubKey)
  })

  it('Register a DID', async () => {
    const receipt = await maxBlockApi.registerDid(did, pubKey)
    console.log('RECEIPT:', JSON.stringify(receipt))
    expect(receipt).to.be.exist
    expect(receipt.status).to.eq(1)
  })

  it('GetKey from a DID', async () => {
    const key = await maxBlockApi.getActualDidKey(did)
    console.log('Did: ' + did + ' Returned key@: ' + key)
    expect(key).equal(pubKey)
  })

  it('Register a Did Doc Hash', async () => {
    await maxBlockApi.registerDidDocument(did, randomHash)
    console.log('Register a Did Doc Hash - Did:' + did + ' RandomHash:' + randomHash)
    const result = await maxBlockApi.getDidDocHash(did)
    console.log('getDidDocHash - Query - Hash', result)
    expect(randomHash).equal(result)
  })

  it('Rotate Key', async () => {
    await maxBlockApi.rotateKey(did, newPubKey)
    const key = await maxBlockApi.getActualDidKey(did)
    console.log('Rotate Key test - Did:' + did + ' Old key:' + pubKey + ' New registered key:' + key)
    expect(key).equal(newPubKey)
  })

  after('Clean up connections', async () => {
    maxBlockApi.disconnect()
  })
})
