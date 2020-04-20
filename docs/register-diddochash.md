```javascript
    return nonFungibleTokenItem.NonFungibleTokenItem.fromSymbol(this.symbol, did, this.wallet).then((tkItem) => {
      return tkItem.updateMetadata(JSON.stringify(newData)).then(() => {
      })
    })
```