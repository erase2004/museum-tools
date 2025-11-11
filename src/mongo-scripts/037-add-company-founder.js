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
printjson(db.companies.bulkWrite(bulkOperations));