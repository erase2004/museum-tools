// 最萌亂鬥大賽資料集
import type { Db } from 'mongodb';
import { z } from 'zod';
import { datetime, itemId, objectId } from './schema';

const schema = z.object({
  _id: objectId,
  /** 起始日期 */
  beginDate: datetime,
  /** 結束日期 */
  endDate: datetime,
  /** 報名截止日期 */
  joinEndDate: datetime,
  /** 所有參賽者 companyId 依隨機順序排列，在報名截止後生成，dbArenaFighters 的 attackSequence 將對應此陣列的index。 */
  shuffledFighterCompanyIdList: itemId.array(),
});

export const arenaSchema = schema;

export function getDBArena(db: Db) {
  return db.collection('arena');
}
