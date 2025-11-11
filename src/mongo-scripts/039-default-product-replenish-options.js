// default product replenish options
// 適用於第五季之前的紀錄

const bulkOperations = [];
printjson(db.products.updateMany({}, 
  {
    $set: {
      replenishBaseAmountType: 'stockAmount',
      replenishBatchSizeType: 'verySmall'
    }
  }
));