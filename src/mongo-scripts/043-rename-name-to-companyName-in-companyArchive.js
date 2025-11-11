// rename name to companyName in companyArchive
// 適用於第六季之前的紀錄

db.companyArchive.dropIndex({ name: 1 });
printjson(db.companyArchive.updateMany({}, { $rename: { name: 'companyName' } }));
db.companyArchive.createIndex({ companyName: 1 }, { unique: true });
