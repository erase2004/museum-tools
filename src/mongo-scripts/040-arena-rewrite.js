// arena rewrite
// 適用於第五季之前的紀錄

const arenaFighterAttributeNameList = ['hp', 'sp', 'atk', 'def', 'agi'];

// 以能力值投入總額計算總投資額
function getTotalInvestedAmount(arenaFighter) {
  return arenaFighterAttributeNameList.reduce((sum, attrName) => {
    return sum + arenaFighter[attrName];
  }, 0);
}

const bulkOperations = [];

// 總投資額計算
db.arenaFighters.find({}).forEach((arenaFighter) => {
  bulkOperations.push({
    updateOne: {
      filter: {
        _id: arenaFighter._id
      },
      update: {
        $set: {
          totalInvestedAmount: getTotalInvestedAmount(arenaFighter)
        }
      }
    }
  });
});
// 名次計算
db.arena.find({winnerList: { $exists: true } }, { _id: 1, winnerList: 1 })
  .forEach(({_id: arenaId, winnerList}) => {
    winnerList.forEach((companyId, index) => {
      const rank = index + 1;
      bulkOperations.push({
        updateOne: {
          filter: {
            arenaId,
            companyId,
          },
          update: {
            $set: {
              rank
            }
          }
        }
      });
    })
  })

printjson(db.arenaFighters.bulkWrite(bulkOperations));