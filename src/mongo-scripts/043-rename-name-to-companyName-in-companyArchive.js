// rename name to companyName in companyArchive
// 適用於第六季之前的紀錄
const MIGRATION_NUMBER = 100

db.companyArchive.dropIndex({ name: 1 });
printjson(db.companyArchive.updateMany({}, { $rename: { name: 'companyName' } }));
db.companyArchive.createIndex({ companyName: 1 }, { unique: true });
db.migrations.updateOne({}, { $set: { version: MIGRATION_NUMBER } });