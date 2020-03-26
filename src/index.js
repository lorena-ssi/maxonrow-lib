'use strict'

const { mxw, utils, nonFungibleToken } = require('mxw-sdk-js')
const { NonFungibleTokenActions, performNonFungibleTokenStatus } = nonFungibleToken
const bigNumberify = utils.bigNumberify
const Utils = require('../src/utils/utils')

const indent = '     '

/**
 * Javascript Class to interact with Maxonrow Blockchain.
 */
module.exports = class LorenaMaxonrow {
  constructor (nodeProvider) {
    this.api = false
    this.keypair = {}
    this.units = 1000000000
    this.nodeProvider = {
      connection: {
        url: 'localhost',
        timeout: 60000
      },
      trace: {
        silent: false,
        silentRpc: false
      },
      chainId: 'unknown',
      name: 'mxw',
      kyc: {
        issuer: 'dunno'
      },
      nonFungibleToken: {
        provider: 'dunno',
        issuer: 'dunno',
        middleware: 'dunno',
        feeCollector: 'dunno'
      },
      ...nodeProvider
    }

    this.defaultOverrides = {
      logSignaturePayload: (payload) => {
        if (!this.nodeProvider.trace.silentRpc) console.log(indent, 'signaturePayload:', JSON.stringify(payload))
      },
      logSignedTransaction: (signedTransaction) => {
        if (!this.nodeProvider.trace.silentRpc) console.log(indent, 'signedTransaction:', signedTransaction)
      }
    }
  }

  async connect () {
    return new Promise((resolve, reject) => {
      this.providerConnection = new mxw.providers.JsonRpcProvider(this.nodeProvider.connection, this.nodeProvider)
      const silentRpc = this.nodeProvider.trace.silentRpc
      this.providerConnection
        .on('rpc', function (args) {
          if (!silentRpc) {
            if (args.action === 'response') {
              console.log(indent, 'RPC REQ:', JSON.stringify(args.request))
              console.log(indent, '    RES:', JSON.stringify(args.response))
            }
          }
        })
        .on('responseLog', function (args) {
          if (!silentRpc) {
            console.log(indent, 'RES LOG:', JSON.stringify({ info: args.info, response: args.response }))
          }
        })

      try {
        const silent = this.nodeProvider.trace.silent
        const wallet = mxw.Wallet.fromMnemonic(this.nodeProvider.kyc.issuer).connect(this.providerConnection)
        if (!silent) console.log(indent, 'Wallet:', JSON.stringify({ address: wallet.address, mnemonic: wallet.mnemonic }))

        const provider = mxw.Wallet.fromMnemonic(this.nodeProvider.nonFungibleToken.provider).connect(this.providerConnection)
        if (!silent) console.log(indent, 'Provider:', JSON.stringify({ address: provider.address, mnemonic: provider.mnemonic }))

        this.issuer = mxw.Wallet.fromMnemonic(this.nodeProvider.nonFungibleToken.issuer).connect(this.providerConnection)
        if (!silent) console.log(indent, 'Issuer:', JSON.stringify({ address: this.issuer.address, mnemonic: this.issuer.mnemonic }))

        const middleware = mxw.Wallet.fromMnemonic(this.nodeProvider.nonFungibleToken.middleware).connect(this.providerConnection)
        if (!silent) console.log(indent, 'Middleware:', JSON.stringify({ address: middleware.address, mnemonic: middleware.mnemonic }))

        if (!silent) console.log(indent, 'Fee collector:', JSON.stringify({ address: this.nodeProvider.nonFungibleToken.feeCollector }))

        return resolve()
      } catch (error) {
        console.log(error)
        return reject(error)
      }
    })
  }

  async createIdentityToken (did, pubKey) {
    // Convert did string to hashed did
    const hashedDID = Utils.hashCode(did)

    // Convert pubKey to vec[u8]
    const arr = Utils.toUTF8Array(pubKey)

    console.log('Hasheddid:' + hashedDID + ' UTF8 pubkey arr:' + arr)

    const key = {
      publicKey: pubKey,
      diddoc_hash: 'empty',
      valid_from: Date.now().toString(),
      valid_to: '0'
    }
    console.log('yout key is:', key)

    // Mutable data
    const metadata = {
      keys: [key],
      keyIndex: 1
    }

    // Immutable data
    const properties = {

    }
    //               CAIO
    //         |       |              |
    // idHme=PARENT   PARENT=idJob    ... = Identidad :  DID
    //     |  |
    //     H  H  H

    //     Identity = DID
    //     |      |     |
    //     Key   Key

    //     Identity = CAIO
    //     NonFungibleToken - DIDs
    //     NonFungibleTokenItem =

    //     //* Operation 2 : Mint NFT Item to own-self
    //     // let nftItemMinted: NonFungibleTokenItem;

    //     let item = {
    //       symbol: "DID",
    //       itemID: 'did:example:123456#oidc',
    //       properties: "properties",
    //       metadata: "str1"
    //     }

    //     let minterNFT = new NonFungibleToken("DID", issuer);

    //     return minterNFT.mint(issuer.address, item).then((receipt) => {
    //       console.log(receipt); //do something
    //     });

    this.nonFungibleTokenProperties = {
      name: 'Decentralised identifier ',
      symbol: 'Identity no??? BORRA esto y ejecuta a ver que pasa', // pongo identity por que el DDID ya lo han creado ellos.... (además tendremos que añadirlo)
      fee: {
        to: this.nodeProvider.nonFungibleToken.feeCollector, // feeCollector wallet address
        value: bigNumberify('1')
      },
      properties: JSON.stringify(properties), // immutable
      metadata: JSON.stringify(metadata) // mutable
    }
    return nonFungibleToken
      .NonFungibleToken
      .create(
        this.nonFungibleTokenProperties,
        this.issuer, // this.nodeProvider.nonFungibleToken.issuer,
        this.defaultOverrides
      )
      .then((token) => {
        if (token) {
          //* Approve
          const overrides = {
            tokenFees: [
              { action: NonFungibleTokenActions.transfer, feeName: 'default' }, // Should not be possible
              { action: NonFungibleTokenActions.transferOwnership, feeName: 'default' }, // Should not be possible
              { action: NonFungibleTokenActions.acceptOwnership, feeName: 'default' } // Should not be possible
            ],
            endorserList: [],
            mintLimit: false,
            transferLimit: 0,
            burnable: false,
            transferable: false,
            modifiable: true,
            pub: true // not public
          }
          return performNonFungibleTokenStatus(
            this.nonFungibleTokenProperties.symbol,
            token.NonFungibleToken.approveNonFungibleToken,
            overrides
          )
            .then((receipt) => {
              console.log(receipt) // do something
            })
        }
      })
  }

  async registerDid (did, pubkey) {

  }

  async getActualKey (did) {

  }

  async registerDidDocHash (did, diddocHash) {

  }

  async rotateKey (did, newpubKey) {

  }

  disconnect () {
    this.providerConnection.removeAllListeners()
  }
}
