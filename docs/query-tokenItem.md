```javascript
    return nonFungibleTokenItem.NonFungibleTokenItem.fromSymbol(this.symbol, did, this.wallet).then((tkItem) => {
      console.log(tkItem.state.metadata)
    })
```