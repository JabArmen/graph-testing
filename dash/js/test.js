let timestamps
let symbols = new Map()
//setInterval

fetch('./Exchange_1.json')
  .then(response => response.json())
  .then(data => {
    ExchangeIndex = 0
    
    timestamps = data.map((item) => item.TimeStampEpoch - 1704446880000000000);
    i = 0
    console.log(timestamps)
    // Intervals 
    setInterval(() => {
      quarterSecond = 25000000
      
      console.log(i)
      if (timestamps[ExchangeIndex] >= i && timestamps[ExchangeIndex] < i + quarterSecond) {
        
        while(timestamps[ExchangeIndex] < i + quarterSecond) {
          
          if(data[ExchangeIndex].MessageType == "NewOrderRequest") {
            newOrderRequest(data)
          } else if(data[ExchangeIndex].MessageType == "Cancelled") {
            cancelled(data)
          }

          console.log(symbols)
          ExchangeIndex += 1          
        }
      }
      i+=quarterSecond
  }, 250);
    console.log(data);   
  })
  .catch(error => console.error('Error fetching JSON:', error)); 
  

function newOrderRequest(data){
  

  // current symbol exists
  console.log(symbols)
  if (symbols.has(data[ExchangeIndex].Symbol)) {
    console.log(data[ExchangeIndex].Symbol)
    //add to symbols map
    symbols.get(data[ExchangeIndex].Symbol)[0].set(data[ExchangeIndex].OrderID, data[ExchangeIndex].OrderPrice)
    
    // check the minimum
    if (symbols.get(data[ExchangeIndex].Symbol)[1] > data[ExchangeIndex].OrderPrice) {
      symbols.get(data[ExchangeIndex].Symbol)[1] = data[ExchangeIndex].OrderPrice 
    }
    
  } else {
    //create a new map inside the symbols map
    symbols.set(data[ExchangeIndex].Symbol, [new Map(), data[ExchangeIndex].OrderPrice])
    
    
  }
  symbols.get(data[ExchangeIndex].Symbol)[0].set(data[ExchangeIndex].OrderID, data[ExchangeIndex].OrderPrice)
}

function cancelled(data){
  if(symbols.has(data[ExchangeIndex].Symbol) && symbols.get(data[ExchangeIndex].Symbol)[0].has(data[ExchangeIndex].OrderID)) {
    if(symbols.get(data[ExchangeIndex].Symbol)[0].get(data[ExchangeIndex].OrderID) == symbols.get(data[ExchangeIndex].Symbol)[1]) {
      symbols.get(data[ExchangeIndex].Symbol)[0].delete(data[ExchangeIndex].OrderID)
      symbols.get(data[ExchangeIndex].Symbol)[1] = Math.min(...symbols.get(data[ExchangeIndex].Symbol)[0].values())
    } else {
      symbols.get(data[ExchangeIndex].Symbol)[0].delete(data[ExchangeIndex].OrderID)
    }
  }
}