# Lorena-Maxonrow integration README

### Use Maxonrow Blockchain
Blockchain usage is specified by argument.

--didMethod=did:lor:max

## Design

Infer from didMethod which Blockchain class must be instantiated

![Dids structure in MXN Blockchain](docs/images/lorena-mxn.jpg)

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
    A Maxonrow blockchain Token is like a class definition where you define the Token Symbol, metadata and properties.
    - Symbol is the class ID
         In our case symbol = LORDID
    - Metadata is a mutable data field for this Token (class)
    - Properties is a inmutable data field for this Token (class)


2) Create a TokenItem (i.e. an Identity)
    - A TokenItem must assign a symbol (should be Token symbol it belongs to)
    - itemID = Item Unique ID (used during search)
    - Properties and metadata for this Item (object)
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
    - [Create a Token](docs/create-token-sample.md)
    - [Create a Token Item and mint it](docs/create-tokenItem-and_mint.md)
    - [Query a Token Item](docs/query-tokenItem.md)
    - [Register a DID document Hash](docs/register-diddochash.md)
    - [Rotate key](docs/rotate-key.md)

### Running the tests
Before running the tests don't forget to export the keys and variables inside .env file (not in the repo for security reasons).
The .env file is Google Drive maxonrow-integration folder.


<!--stackedit_data:
eyJoaXN0b3J5IjpbMjA2MTYwMzYyOCwtMzI4Njg1NDU0LC0xMz
c3NjU4MjE4XX0=
-->
