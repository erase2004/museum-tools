// 使用者持有產品資料集
import type { Db } from 'mongodb';
import { z } from 'zod';
import { integer, itemId } from './schema';

const schema = z.object({
  /** 使用者 ID */
  userId: itemId,
  /** 產品公司 ID */
  companyId: itemId,
  /** 產品 ID */
  productId: itemId,
  /** 持有數量 */
  amount: integer.min(1),
  /** 產品價格 */
  price: integer.min(1),
});

export const userOwnedProductSchema = schema;

export function getDBUserOwnedProduct(db: Db) {
  return db.collection('userOwnedProducts');
}
