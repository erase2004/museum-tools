// 違規案件資料集
import type { Db } from 'mongodb';
import { z } from 'zod';
import { typedObjectKeys } from '@/utils/helper';
import { datetime, itemId, objectId } from './schema';

const violatorTypeList = ['user', 'company', 'product'] as const;

const stateMap = {
  pending: {
    displayName: '待處理',
  },
  processing: {
    displayName: '處理中',
  },
  rejected: {
    displayName: '已駁回',
  },
  closed: {
    displayName: '已結案',
  },
};

const categoryMap = {
  company: {
    displayName: '公司違規',
  },
  foundation: {
    displayName: '新創違規',
  },
  product: {
    displayName: '產品違規',
  },
  advertising: {
    displayName: '廣告違規',
  },
  multipleAccounts: {
    displayName: '分身違規',
  },
  miscellaneous: {
    displayName: '其他違規',
  },
};

const violatorSchema = z.object({
  /** 違規者的型態 */
  violatorType: z.enum(violatorTypeList),
  /** 違規者的 ID */
  violatorId: itemId,
});

const schema = z.object({
  _id: objectId,
  /** 違規案件目前處理狀態 */
  state: z.enum(typedObjectKeys(stateMap)),
  /** 違規案件類型 */
  category: z.enum(typedObjectKeys(categoryMap)),
  /** 案件描述 */
  description: z.string().min(10).max(3000),
  /** 違規名單 */
  violators: violatorSchema.array(),
  /** 未讀的使用者標記 */
  unreadUsers: itemId.array(),
  /** 相關案件 */
  relatedCases: itemId.array(),
  /** 建立日期 */
  createdAt: datetime,
  /** 最後更新日期 */
  updatedAt: datetime,
});

export const violationCaseSchema = schema;

export function getDBViolationCases(db: Db) {
  return db.collection('violationCases');
}
