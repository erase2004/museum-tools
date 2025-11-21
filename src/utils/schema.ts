import type { Db } from 'mongodb';
import z from 'zod';

export function getDBMigrations(db: Db) {
  return db.collection('migrations');
}

export function getDBCompanies(db: Db) {
  return db.collection('companies');
}

export function getDBCompanyArchive(db: Db) {
  return db.collection('companyArchive');
}

export function getDBViolationCases(db: Db) {
  return db.collection('violationCases');
}

export function getDBArena(db: Db) {
  return db.collection('arena');
}

export function getDBArenaLog(db: Db, arenaId: string) {
  return db.collection(`arenaLog${arenaId}`);
}

export function getDBUsers(db: Db) {
  return db.collection('users');
}

export function getDBUserOwnProducts(db: Db) {
  return db.collection('userOwnedProducts');
}

export function getDBDirectors(db: Db) {
  return db.collection('directors');
}

export function getDBSeason(db: Db) {
  return db.collection('season');
}

//////

export const objectId = z.coerce.string();

export const itemId = z.string();

export const integer = z.number().int();

export const companySchema = z.object({
  _id: objectId,
  companyName: z.string(),
  isSeal: z.boolean().default(false),
});

export const profileSchema = z.object({
  /** 使用者名稱 */
  name: z.string(),
  roles: z
    .string()
    .array()
    .refine((val) => {
      if (val.length > 0) {
        const validRoles = ['superAdmin', 'generalManager', 'developer', 'planner', 'fscMember'];

        return val.every((v) => validRoles.includes(v));
      }
      return true;
    }),
  /** 帳號驗證來源 */
  validateType: z.enum(['Google', 'PTT', 'Bahamut']),
  /** 金錢數量 */
  money: integer,
  /** 消費券的數量 */
  vouchers: integer.min(0).default(7000),
  /** 推薦票數量 */
  voteTickets: integer.min(0).default(0),
  /** 是否處於渡假模式 */
  /** 各類石頭的數量 */
  stones: z
    .object({
      saint: integer.min(0).default(0),
      birth: integer.min(0).default(0),
      rainbow: integer.min(0).default(0),
      rainbowFragment: integer.min(0).default(0),
      quest: integer.min(0).default(0),
    })
    .partial()
    .default({}),
});

export const userSchema = z.object({
  _id: objectId,
  /** 使用者 PTT 帳號名稱 */
  username: z.string().nullish(),
  favorite: z.string().array().default([]),
  profile: profileSchema,
});

export const directorSchema = z
  .object({
    /** 公司 ID */
    companyId: itemId,
    /** 董事 user ID */
    userId: itemId,
    /** 擁有股份 */
    stocks: integer.min(1),
  }) // 縮短 key，減少輸出的檔案尺寸
  .transform((value) => ({ u: value.userId, c: value.companyId, s: value.stocks }));

export const ownProductSchema = z.object({
  /** 使用者 ID */
  userId: itemId,
  /** 產品公司 ID */
  companyId: itemId,
  /** 持有數量 */
  amount: integer.min(1),
  /** 產品價格 */
  price: integer.min(1),
});

export const seasonSchema = z.object({
  _id: objectId,
});

export const arenaSchema = z.object({
  _id: objectId,
});
