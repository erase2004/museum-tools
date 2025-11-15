// new product distribution method
// 適用第一季的紀錄

printjson(db.companies.updateMany({}, { $rename: { seasonalBonusPercent: 'employeeBonusRatePercent' }}));

printjson(db.log.updateMany({ logType: '營利分紅' }, { $rename: { 'data.bonus': 'data.amount' }}));

