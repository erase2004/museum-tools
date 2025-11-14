// add company founder
// 適用於第五季之前的紀錄

const bulkOperations = [];
db.log.find({ logType: '創立公司' }).forEach(({ companyId, userId }) => {
  const founder = userId[0];

  bulkOperations.push({
    updateOne: {
      filter: {
        _id: companyId
      },
      update: {
        $set: {
          founder
        }
      }
    }
  });
});

// 針對第一季的處理，抓取創立得股的第一位使用者
db.log.aggregate([
  {
    $match: {
      logType: "創立得股"
    }
  },
  {
    $sort: {
      createdAt: 1
    }
  },
  {
    $group: {
      _id: "$companyId",
      userId: {
        $first: "$userId"
      }
    }
  }
]).forEach(({ _id: companyId, userId }) => {
  const founder = userId[0];

  bulkOperations.push({
    updateOne: {
      filter: {
        _id: companyId
      },
      update: {
        $set: {
          founder
        }
      }
    }
  });
});

printjson(db.companies.bulkWrite(bulkOperations));