// 季度資料集
import type { Db } from 'mongodb';
import { z } from 'zod';
import { datetime, integer, objectId } from './schema';

const schema = z.object({
  _id: objectId,
  /** 賽季的第幾季度 */
  ordinal: integer,
  /** 起始日期 */
  beginDate: datetime,
  /** 結束日期 */
  endDate: datetime,
  /** 當季有多少驗證通過的使用者 */
  userCount: integer,
  /** 當季起始時有多少未被查封的公司 */
  companiesCount: integer,
  /** 當季有多少推出的新產品 */
  productCount: integer,
});

export const seasonSchema = schema;

export function getDBSeason(db: Db) {
  return db.collection('season');
}
