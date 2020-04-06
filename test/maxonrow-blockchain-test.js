'use strict'
const chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

// Configure chai
chai.should()
const expect = chai.expect
chai.use(chaiAsPromised)

require('dotenv').config()
const LorenaMaxonrow = require('../src/index.js')
const Utils = require('../src/utils/utils')
const Zen = require('@lorena-ssi/zenroom-lib')
const z = new Zen('sha256')

// MaxonRow errors
// TODO: Should be used when MaxonRow errors are expected
// const { errors } = require('mxw-sdk-js')

// 'caelumlabs' SHA256 hash
// const caelumHashedDid = '42dd5715a308829e'

const nodeProvider = {
  connection: {
    url: process.env.EndpointUrl || 'localhost',
    timeout: 60000
  },
  trace: {
    silent: true,
    silentRpc: true
  },
  chainId: process.env.ChainId,
  name: 'mxw',
  kyc: { issuer: process.env.KycIssuer },
  nonFungibleToken: {
    provider: process.env.ProviderWalletMnemonic || 'dunno',
    issuer: process.env.ProviderWalletMnemonic || 'dunno',
    middleware: process.env.IssuerWalletMnemonic || 'dunno',
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
  let did, pubKey

  before('Lorena Substrate Test Preparation', async () => {
    const didString = Utils.makeUniqueString(16)
    did = await generateDid(didString)
    pubKey = await generatePublicKey(did)
    maxBlockApi = new LorenaMaxonrow(nodeProvider)
    await maxBlockApi.connect()
  })

  // it('Generate a DID and publicKey', async () => {
  //   const didGenTest = await generateDid('caelumlabs')
  //   const pubKeyGenTest = await generatePublicKey(didGenTest)
  //   console.log('didGen: ' + didGenTest + ' pubkey: ' + pubKeyGenTest)
  //   expect(didGenTest).equal(caelumHashedDid)
  // })

  it('sohuld create a Key NonFungibleTokenItem', async () => {
    const keyId = 'keyId-1'
    const myKey = maxBlockApi.createKeyTokenItem(keyId, pubKey)
    console.log('My key is: ', myKey)
    expect(myKey).to.be.an('object')
    expect(myKey).to.have.any.keys(
      'symbol',
      'itemID',
      'properties',
      'metadata'
    )
    expect(myKey.symbol).to.eq('LORKEY')
    expect(myKey.itemID).to.eq('#' + keyId)
    
    const jsonProperties = JSON.parse(myKey.properties)
    console.log(jsonProperties)
    expect(jsonProperties).to.be.an('object')
    expect(jsonProperties).to.have.any.keys(
      'publicKey',
      'validFrom'
    )
    expect(jsonProperties.publicKey).to.eq(pubKey)
    
    expect(myKey.metadata).to.be.a('string')
    const metadata = { diddocHash: '', validTo: '' }
    expect(myKey.metadata).to.eq(JSON.stringify(metadata))
  })

  it('Create Non Fungible Token', async () => {
    try {
      await maxBlockApi.createIdentityToken()
    } catch (err) {
      // TODO: use MaxonRow errors
      expect(err.info.message).to.eq('Token already exists: LORDID')
    }
  })

  // it('Register a DID', async () => {
  //   // SetKeyring and Connect are being called here because mocha Before function is not waiting fro Keyring WASM library load
  //   maxBlockApi.setKeyring('Alice')
  //   await maxBlockApi.registerDid(did, pubKey)
  // })

  // it('Check DID registration', async () => {
  //     const registeredDid = await subscribe2RegisterEvents(maxBlockApi.api, 'DidRegistered')
  //     console.log('Registered DID:', registeredDid)
  //     maxBlockApi.api.query.system.events()
  //     console.log('Unsubscribed')
  //     const hexWithPadding = registeredDid.split('x')[1]
  //     const hex = hexWithPadding.substring(0, 16)
  //     // console.log('HEX', hex)
  //     console.log('UTF8', Buffer.from(hex, 'hex').toString('utf8'))
  //     expect(hex).equal(did)
  // })

  // it('GetKey from a DID', async () => {
  //     maxBlockApi.getActualDidKey(did).then((key) => {
  //         console.log('Did: ' + did + ' Returned key@: ' + key)
  //         // console.log('HEX', hex)
  //         // console.log('UTF8', Buffer.from(hex, 'hex').toString('utf8'))
  //         expect(key).equal(pubKey)
  //     })
  // })

  // it('Register a Did Doc Hash', async () => {
  //   const randomHash = Utils.makeUniqueString.toString(16)
  //   await maxBlockApi.registerDidDocument(did, randomHash)
  //   console.log('Register a Did Doc Hash - Did:' + did + ' RandomHash:' + randomHash)
  //   await maxBlockApi.getDidDocHash(did) (result)
  //   console.log('getDidDocHash - Query - Hash', result)
  // })

  // it('Rotate Key', async () => {
  //     const newPubKey = await generatePublicKey(did)
  //     await maxBlockApi.rotateKey(did, newPubKey)
  //     await subscribe2RegisterEvents(maxBlockApi.api, 'KeyRotated')
  //     const key = await maxBlockApi.getActualDidKey(did)
  //     console.log('Rotate Key test - Did:' + did + ' Old key:' + pubKey + ' New registered key:' + key)
  //     expect(key).equal(newPubKey)
  // })

  after('Clean up connections', function () {
    maxBlockApi.disconnect()
  })
})
