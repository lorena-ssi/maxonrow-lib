'use strict'

const mxw = require('mxw-sdk-js')
const { token, NonFungibleTokenActions, performNonFungibleTokenStatus } = require('mxw-sdk-js').nonFungibleToken
const bigNumberify = require('mxw-sdk-js').utils.bigNumberify

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

    //* Operation 1 : Create new non fungible token
    this.nonFungibleTokenProperties = {
      name: 'Decentralised identifier ', // name
      symbol: 'DID', // symbol
      fee: {
        to: this.nodeProvider.nonFungibleToken.feeCollector, // feeCollector wallet address
        value: bigNumberify('1')
      },
      metadata: 'Wallet able to manage their own metadata',
      properties: 'Decentralised identifier'
    }

    this.defaultOverrides = {
      logSignaturePayload: function (payload) {
        if (!this.nodeProvider.trace.silentRpc) console.log(indent, 'signaturePayload:', JSON.stringify(payload))
      },
      logSignedTransaction: function (signedTransaction) {
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

        const issuer = mxw.Wallet.fromMnemonic(this.nodeProvider.nonFungibleToken.issuer).connect(this.providerConnection)
        if (!silent) console.log(indent, 'Issuer:', JSON.stringify({ address: issuer.address, mnemonic: issuer.mnemonic }))

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

  async createIdentity () {
    return token.NonFungibleToken.create(this.nonFungibleTokenProperties,
      this.nodeProvider.nonFungibleToken.issuer,
      this.defaultOverrides).then((token) => {
      if (token) {
        //* Approve
        const overrides = {
          tokenFees: [
            { action: NonFungibleTokenActions.transfer, feeName: 'default' },
            { action: NonFungibleTokenActions.transferOwnership, feeName: 'default' },
            { action: NonFungibleTokenActions.acceptOwnership, feeName: 'default' }
          ],
          endorserList: [],
          mintLimit: 1,
          transferLimit: 0,
          burnable: false,
          transferable: false,
          modifiable: true,
          pub: true // not public
        }

        return performNonFungibleTokenStatus(this.nonFungibleTokenProperties.symbol,
          token.NonFungibleToken.approveNonFungibleToken,
          overrides).then((receipt) => {
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
