// tax separate
// 適用於第四季之前的紀錄

printjson(db.taxes.updateMany({
  tax: { $exists: true },
  zombie: { $exists: true }
}, {
  $rename: { 'tax': 'stockTax', 'zombie': 'zombieTax' },
  $set: { 'moneyTax': 0 }
}));

printjson(db.log.updateMany({
  logType: '季度賦稅',
  'data.assetTax': {
    $exists: true,
  },
}, {
  $rename: { 'data.assetTax': 'data.stockTax' },
  $set: { 'data.moneyTax': 0 }
}));