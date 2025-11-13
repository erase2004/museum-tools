// tax separate
// 適用於第四季之前的紀錄

printjson(db.taxes.updateMany({
  zombie: { $exists: true }
}, {
  $rename: { 'zombie': 'zombieTax' },
}));