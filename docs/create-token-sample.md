# Token sample

```javascript
async createIdentityToken () {
    this.nonFungibleTokenProperties = {
      name: 'Decentralised identifier Test',
      symbol: this.symbol,
      fee: {
        to: this.nodeProvider.nonFungibleToken.feeCollector, // feeCollector wallet address
        value: bigNumberify('1')
      },
      metadata: 'Wallet able to manage their own metadata',
      properties: 'Decentralised identifier'
    }
    return nonFungibleToken
      .NonFungibleToken
      .create(
        this.nonFungibleTokenProperties,
        this.wallet, // This is the token owner wallet
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
            mintLimit: 0,
            transferLimit: 0,
            burnable: false,
            transferable: false,
            modifiable: true,
            pub: true // not public
          }

          // For the approval process, we need 3 system wallets to sign the approval transaction.
          // Those 3 system wallets should keep in SECRET and AVOID EXPOSE to public
          // 1st signer: Provider wallet sign the approval transaction
          return nonFungibleToken.NonFungibleToken.approveNonFungibleToken(this.symbol, this.provider, overrides).then((transaction) => {
            // 2nd signer: Issuer wallet sign the approval transaction
            return nonFungibleToken.NonFungibleToken.signNonFungibleTokenStatusTransaction(transaction, this.issuer)
          }).then((transaction) => {
            // 3rd signer: Middleware wallet sign the approval transaction
            return nonFungibleToken.NonFungibleToken.sendNonFungibleTokenStatusTransaction(transaction, this.middleware)
          }).then(() => {
            // Refresh the token details from blockchain after approved
            return token.refresh().then(() => {
              // Keep this token object for later use, bear in mind the token only needed to create once and use for many times
              // To get back the approved token, call loadIdentityToken
              this.token = token
            })
          })
        }
      })
  }
```