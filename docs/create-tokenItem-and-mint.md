```javascript
  createKeyTokenItem (did, pubKeyReceived) {
    const keyStruct = {
      key: pubKeyReceived,
      valid_from: Date.now().toString(),
      valid_to: '0'
    }

    // Mutable data
    const metadata = {
      publicKeys: [keyStruct],
      diddocHash: ''
    }

    // Immutable data
    const properties = {
    }

    return {
      symbol: this.symbol,
      itemID: did,
      properties: JSON.stringify(properties), // immutable
      metadata: JSON.stringify(metadata)
    }
  }


  async registerDid (did, pubKey) {
    const key = this.createKeyTokenItem(did, pubKey)
    return nonFungibleToken.NonFungibleToken.fromSymbol(this.symbol, this.wallet).then((minterIdentity) => {
      // Mint to this wallet address
      return minterIdentity.mint(this.wallet.address, key).then((receipt) => {
        console.log(receipt) // do something
        return receipt
      })
    })
  }
  ```