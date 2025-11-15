// new product system
// 適用第一季的紀錄

printjson(db.users.updateMany({}, { $rename: { 'profile.vote': 'profile.voteTickets' }}));

printjson(db.products.updateMany({}, { $rename: { votes: 'voteCount' }}));

// 廢棄 overdue，改用 state
const stateOverdueMap = {
  planning: 0,
  marketing: 1,
  ended: 2
};

const bulkOperations = []

Object.entries(stateOverdueMap).forEach(([ state, overdue]) => {
  bulkOperations.push({
    updateMany: {
      filter: {
        overdue,
      },
      update: {
        $set: { state }
      }
    }
  });
});

bulkOperations.push({
  updateMany: {
    filter: {},
    update: {
      $set: {
        price: 1,
        totalAmount: 1,
        stockAmount: 0,
        availableAmount: 0
      }
    }
  }
});

printjson(db.products.bulkWrite(bulkOperations));