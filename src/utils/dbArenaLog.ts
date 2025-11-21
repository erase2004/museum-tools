// 最萌亂鬥大賽紀錄資料集
import type { Db } from 'mongodb';
import { z } from 'zod';
import { integer, itemId, objectId } from './schema';

const schema = z.object({
  _id: objectId,
  /** 紀錄的順序 */
  sequence: integer,
  /** 紀錄的回合數 */
  round: integer,
  /** 紀錄相關的公司ID陣列, 0 為攻擊者, 1 為防禦者 */
  companyId: itemId.array(),
  /**
   * 紀錄攻擊者使用的招式 index，
   * 正數 -1 對應 dbArenaFighters 資料集的 normalManner 陣列 index，
   * 負數 +1 對應 specialManner 的陣列 index
   */
  attackManner: integer,
  /** 紀錄當次攻擊動作造成的傷害，0 為未命中 */
  damage: integer,
  /** 紀錄攻擊者發動攻擊時的 SP */
  attackerSp: integer,
  /** 紀錄防禦者被攻擊後的 HP */
  defenderHp: integer,
  /** 紀錄若防禦者被擊倒，攻擊者得到的收益 */
  profit: z.number().nullish(),
});

export const arenaLogSchema = schema;

function getCollectionName(arenaId: string) {
  return `arenaLog${arenaId}`;
}

export function getDBArenaLog(db: Db, arenaId: string) {
  return db.collection(getCollectionName(arenaId));
}
