// add ordinal to season
// 適用於第四季之前的紀錄

const bulkOperations = []

let index = 0
db.season.find({}).sort({ beginDate: 1 }).forEach(({ _id: seasonId}) => {
  bulkOperations.push({
    updateOne: {
      filter: {
        _id: seasonId,
      },
      update: {
        $set: {
          ordinal: index + 1
        }
      }
    }
  });

  index++;
});

printjson(db.season.bulkWrite(bulkOperations));