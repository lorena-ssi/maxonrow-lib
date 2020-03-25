'use strict'

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
        silent: true,
        silentRpc: true
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
  }

  async connect () {
    // return new Promise((resolve, reject) => {
    //   providerConnection = new mxw.providers.JsonRpcProvider(nodeProvider.connection, nodeProvider)
    //   providerConnection
    //     .on('rpc', function (args) {
    //       if (!silentRpc) {
    //         if (args.action == 'response') {
    //           console.log(indent, 'RPC REQ:', JSON.stringify(args.request))
    //           console.log(indent, '    RES:', JSON.stringify(args.response))
    //         }
    //       }
    //     })
    //     .on('responseLog', function (args) {
    //       if (!silentRpc) {
    //         console.log(indent, 'RES LOG:', JSON.stringify({ info: args.info, response: args.response }))
    //       }
    //     })

    //   try {
    //     wallet = mxw.Wallet.fromMnemonic(nodeProvider.kyc.issuer).connect(providerConnection)
    //     if (!silent) console.log(indent, 'Wallet:', JSON.stringify({ address: wallet.address, mnemonic: wallet.mnemonic }))

    //     provider = mxw.Wallet.fromMnemonic(nodeProvider.nonFungibleToken.provider).connect(providerConnection)
    //     if (!silent) console.log(indent, 'Provider:', JSON.stringify({ address: provider.address, mnemonic: provider.mnemonic }))

    //     issuer = mxw.Wallet.fromMnemonic(nodeProvider.nonFungibleToken.issuer).connect(providerConnection)
    //     if (!silent) console.log(indent, 'Issuer:', JSON.stringify({ address: issuer.address, mnemonic: issuer.mnemonic }))

    //     middleware = mxw.Wallet.fromMnemonic(nodeProvider.nonFungibleToken.middleware).connect(providerConnection)
    //     if (!silent) console.log(indent, 'Middleware:', JSON.stringify({ address: middleware.address, mnemonic: middleware.mnemonic }))

    //     if (!silent) console.log(indent, 'Fee collector:', JSON.stringify({ address: nodeProvider.nonFungibleToken.feeCollector }))

    //     return resolve()
    //   } catch (error) {
    //     console.log(error)
    //     return reject()
    //   }
    // })
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
    this.provider.disconnect()
  }
}
