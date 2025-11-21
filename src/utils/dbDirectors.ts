// 公司持股董事資料集
import type { Db } from 'mongodb';
import { z } from 'zod';
import { integer, itemId } from './schema';

const schema = z.object({
  /** 公司 ID */
  companyId: itemId,
  /** 董事 user ID */
  userId: itemId,
  /** 擁有股份 */
  stocks: integer.min(1),
  /** 要在董事會成員裡留的言 */
  message: z.string().max(100).optional(),
});

export const directorSchema = schema;

export function getDBDirectors(db: Db) {
  return db.collection('directors');
}
