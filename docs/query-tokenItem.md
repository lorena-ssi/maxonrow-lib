```javascript
    return mxw.nonFungibleToken.NonFungibleToken.fromSymbol(this.symbol, did, this.wallet).then((tkItem) => {
        console.log(JSON.stringify(tkItem))
        return tkItem
    })
```