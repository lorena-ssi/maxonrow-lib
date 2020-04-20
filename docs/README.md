# Lorena-Maxonrow integration README

### Use Maxonrow Blockchain
Blockchain usage is specified by argument.

--didMethod=did:lor:max

## Design

Infer from didMethod which Blockchain class must be instantiated

![Dids structure in MXN Blockchain](images/lorena-mxn.jpg)

Initially, the TokenItem structure was conceived to hold the whole Identity's public keys history.
However, due to size limitations on TokenItems, it holds only the most recent key inside the publicKeys array in metadata:
```javascript
    const metadata = {
      publicKeys: [keyStruct], // Array de keyStructures
      diddocHash: ''
    }
```

### Step by step
1) Create a Token (i.e. LORDID) 
    Maxonrow blockchain Tokens is like a class definition where you define the Token Symbol for this of class.
    In our case symbol = LORDID

2) Create a TokenItem (i.e. an Identity)
```javascript
    TokenItem = {
      symbol: this.symbol // Token symbol it belongs to (i.e. LORDID)
      itemID: did   // did string (must be a unique ID here)
      properties:  // immutable data (in our structure we leave it empty)
      metadata: // mutable data
    }
```

3) Mint TokenItem to the Token it belongs
```javascript
    return nonFungibleToken.NonFungibleToken.fromSymbol(this.symbol, this.wallet).then((minterIdentity) => {
      // Mint to this wallet address
      return minterIdentity.mint(this.wallet.address, tkItem).then((receipt) => {
        console.log(receipt) // do something
        return receipt
      })
    })
```

4) Query TokenItem (Identity) and get most recent Public Key
```javascript
    return nonFungibleTokenItem.NonFungibleTokenItem.fromSymbol(this.symbol, did, this.wallet).then((tkItem) => {
      console.log(tkItem.state.metadata)
      const index = JSON.parse(tkItem.state.metadata).publicKeys.length - 1
      const key = JSON.parse(tkItem.state.metadata).publicKeys[index].key
      return key
    })
```


### Practical Examples
    - [Create a Token](create-token-sample.md)
    - [Create a Token Item and mint it](create-tokenItem-and_mint.md)
    - [Query a Token Item](query-tokenItem.md)
    - [Register a DID document Hash](register-diddochash.md)
    - [Rotate key](rotate-key.md)

### Running the tests
Before running the tests don't forget to export the keys and variables inside .env file (not in the repo for security reasons).
The .env file is Google Drive maxonrow-integration folder.


<!--stackedit_data:
eyJoaXN0b3J5IjpbMjA2MTYwMzYyOCwtMzI4Njg1NDU0LC0xMz
c3NjU4MjE4XX0=
-->