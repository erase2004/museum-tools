// create indexes
// 適用所有賽季

print(db.companies.createIndex({ isSeal: 1}));

print(db.employees.createIndex({ userId: 1, resigned: 1, employed: -1}));
print(db.employees.createIndex({ companyId: 1, resigned: 1, registerAt: 1}));
print(db.employees.createIndex({ employed: 1, resigned: 1}));

print(db.productLike.createIndex({ userId: 1}));

print(db.product.createIndex({ seasonId: 1, state: 1}));

print(db.rankCompanyCapital.createIndex({ seasonId: 1}));
print(db.rankCompanyPrice.createIndex({ seasonId: 1}));
print(db.rankCompanyProfit.createIndex({ seasonId: 1}));
print(db.rankCompanyValue.createIndex({ seasonId: 1}));
print(db.rankUserWealth.createIndex({ seasonId: 1}));

print(db.userOwnedProducts.createIndex({ seasonId: 1}));