// product-rating
// 適用於第四季之前的紀錄

const bulkOperations = []

bulkOperations.push({
  updateMany: {
    filter: {
      type: { $nin: ['裏物', '未分類'] }
    },
    update: {
      $set: {
        'rating': '一般向'
      }
    }
  }
});

bulkOperations.push({
  updateMany: {
    filter: {
      type: '裏物'
    },
    update: {
      $set: {
        'original_type': '裏物',
        'type': '未分類',
        'rating': '18禁'
      }
    }
  }
});

printjson(db.products.bulkWrite(bulkOperations));