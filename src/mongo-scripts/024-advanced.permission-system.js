// advanced permission system
// 適用於第三季之前的紀錄

// 廢除舊的 isAdmin 旗標，改用新的權限組設定並指定為金管會成員
printjson(db.users.updateMany({}, {
  $set: {
    'profile.roles': []
  }
}));

printjson(db.users.updateMany({ 'profile.isAdmin': true }, {
  $addToSet: {
    'profile.roles': 'fscMember'
  }
}));

// 處理使用者保管庫的金管會權限設定
printjson(db.userArchive.updateMany({}, {
  $set: {
    roles: []
  }
}));

printjson(db.userArchive.updateMany({ isAdmin: true }, {
  $addToSet: {
    roles: 'fscMember'
  }
}));