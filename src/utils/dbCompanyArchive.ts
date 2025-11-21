// 公司保管庫資料集
import type { Db } from 'mongodb';
import { z } from 'zod';
import { objectId } from './schema';

const schema = z.object({
  _id: objectId,
  /** 公司名稱 */
  companyName: z.string(),
  /** 保管狀態 */
  status: z.enum(['archived', 'foundation', 'market']),
});

export const companyArchiveSchema = schema;

export function getDBCompanyArchive(db: Db) {
  return db.collection('companyArchive');
}
