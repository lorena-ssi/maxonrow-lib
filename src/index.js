'use strict'

const BlockchainInterface = require('@lorena-ssi/blockchain-lib')
const { mxw, utils, nonFungibleToken } = require('mxw-sdk-js')
const { NonFungibleTokenActions, performNonFungibleTokenStatus } = nonFungibleToken
const bigNumberify = utils.bigNumberify
const Utils = require('../src/utils/utils')

const indent = '     '

/**
 * Javascript Class to interact with Maxonrow Blockchain.
 */
module.exports = class LorenaMaxonrow extends BlockchainInterface {
  /**
   * Constructor
   *
   * @param {*} nodeProvider Provider connection information
   */
  constructor (nodeProvider) {
    super()
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

  /**
   * Connect with the Blockchain.
   */
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

  createKeyTokenItem (keyId, pubKey) {
    /**
     * Substrate Key:
     * Key {
     *  publicKey: ,
     *  diddoc_hash: ,
     *  valid_from: ,
     *  valid_to:
     * }
     */

    // Mutable data
    const metadata = {
      diddoc_hash: '',
      valid_to: ''
    }

    // Immutable data
    const properties = {
      publicKey: pubKey,
      valid_from: Date.now().toString()
    }

    return {
      symbol: 'LORKEY',
      itemID: '#' + keyId,
      properties: JSON.stringify(properties), // immutable
      metadata: JSON.stringify(metadata)
    }
  }

  async createIdentityToken (did, pubKey) {
    // Convert did string to hashed did
    const hashedDID = Utils.hashCode(did)

    // Convert pubKey to vec[u8]
    const arr = Utils.toUTF8Array(pubKey)

    console.log('HashedSid:' + hashedDID + ' UTF8 pubkey arr:' + arr)

    // Mutable data
    const metadata = {}

    // Immutable data
    const properties = {
      did
      // ToDo
      // keyIndex: keyId
    }

    this.nonFungibleTokenProperties = {
      name: 'Decentralised identifier ',
      symbol: 'LORID', // pongo identity por que el DDID ya lo han creado ellos.... (además tendremos que añadirlo)
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

  /**
   * Receives a 16 bytes DID string and extends it to 65 bytes Hash
   *
   * @param {string} did DID
   * @param {string} pubKey Public Key to register into the DID
   */
  async registerDid (did, pubKey) {
    const key = this.createKeyTokenItem('keyId', pubKey)
    // console.log('your key is:', key)

    const minterIdentity = new nonFungibleToken.NonFungibleToken('LORID', this.issuer)

    return minterIdentity.mint(this.issuer.address, key).then((receipt) => {
      console.log(receipt) // do something
    })
  }

  /**
   * Returns the actual Key.
   *
   * @param {string} did DID
   * @returns {string} The active key
   */
  async getActualDidKey (did) {

  }

  /**
   * Registers a Hash (of the DID document) for a DID
   *
   * @param {string} did DID
   * @param {string} diddocHash Did document Hash
   */
  async registerDidDocument (did, diddocHash) {
  }

  /**
   * Retrieves the Hash of a Did Document for a DID
   *
   * @param {string} did DID
   * @returns {string} the Hash
   */
  async getDidDocHash (did) {
  }

  /**
   * Rotate Key : changes the actual key for a DID
   *
   * @param {string} did DID
   * @param {string} pubKey Public Key to register into the DID
   */
  async rotateKey (did, newPubKey) {

  }

  /**
   * Disconnect from Blockchain.
   */
  disconnect () {
    if (this.providerConnection) {
      this.providerConnection.removeAllListeners()
    }
  }
}
