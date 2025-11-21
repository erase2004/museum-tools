// 公司資料集
import type { Db } from 'mongodb';
import { z } from 'zod';
import { datetime, integer, itemId, objectId } from './schema';
import { last } from 'lodash-es';

// 公司評等名稱
const gradeNameList = ['S', 'A', 'B', 'C', 'D'] as const;

type Grade = (typeof gradeNameList)[number];

// 公司評等係數
export const gradeFactorTable = {
  // 挖礦機獲利係數
  miningMachine: {
    S: 0.4,
    A: 0.3,
    B: 0.2,
    C: 0.1,
    D: 0,
  },
  // 排名切分比例
  proportion: {
    S: 0.05,
    A: 0.25,
    B: 0.5,
    C: 0.75,
    D: 1.0,
  },
} satisfies Record<string, Record<Grade, number>>;

const schema = z.object({
  _id: objectId,
  /** 董事長的稱謂 */
  chairmanTitle: z.string().max(20).default('董事長'),
  /** 是否被金管會查封關停 */
  isSeal: z.boolean().default(false),
  /** 公司名稱 */
  companyName: z.string().min(1).max(100),
  /** 創立者 User ID */
  founder: itemId,
  /** 經理人 User ID */
  manager: itemId,
  /** 董事長 User ID */
  chairman: itemId,
  /** 小圖 */
  pictureSmall: z.string().url().nullish(),
  /** 大圖 */
  pictureBig: z.string().url().optional(),
  /** 介紹描述 */
  description: z.string().min(10).max(3000),
  /** 違規描述 */
  illegalReason: z.string().max(10).optional(),
  /** 目前總釋出股份 */
  totalRelease: integer.min(0),
  /** 最後成交價格 */
  lastPrice: integer.min(0),
  /** 參考每股單價 */
  listPrice: integer.min(0),
  /** 當季已營利 */
  profit: z.number().min(0).default(0),
  /** 資本額 */
  capital: integer.min(0),
  /** 公司評等 */
  grade: z.enum(gradeNameList).default(last(gradeNameList)!),
  /** 參考總市值 */
  totalValue: integer.min(0),
  /** 公司上市日期 */
  createdAt: datetime,
  /** 員工分紅佔比 */
  employeeBonusRatePercent: z.number().default(5),
  /** 經理分紅佔比 */
  managerBonusRatePercent: z.number().default(5),
  /** 營利投入資本額佔比 */
  capitalIncreaseRatePercent: z.number().default(3),
  tags: z.string().array().max(50),
  /** 選舉經理時的候選者 User ID 列表 */
  candidateList: itemId.array(),
  /** 選舉經理時的各候選者的支持董事 User ID 列表 */
  voteList: itemId.array().array(),
  /** 員工每日薪資 */
  salary: integer.default(1000),
  /** 下季員工每日薪資 */
  nextSeasonSalary: integer.optional().default(1000),
});

export const companySchema = schema;

export function getDBCompanies(db: Db) {
  return db.collection('companies');
}
