```javascript
    return nonFungibleTokenItem.NonFungibleTokenItem.fromSymbol(this.symbol, did, this.wallet).then((tkItem) => {
      const metadata // metadata to replace the one at the Blockchain's TokenItem.
      return tkItem.updateMetadata(JSON.stringify(metadata)).then(() => {
        return metadata.publicKeys[index].key
      })
    })
```