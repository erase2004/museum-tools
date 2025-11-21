import type { Db } from 'mongodb';
import { z } from 'zod';
import { datetime, integer, itemId, objectId } from './schema';
import { stoneTypeList } from './dbCompanyStones';
import { zipObject } from 'lodash-es';

export const BanTypeList = [
  'accuse', // 所有舉報違規行為
  'deal', // 所有投資下單行為
  'chat', // 所有聊天發言行為
  'advertise', // 所有廣告宣傳行為
  'editUserAbout', // 編輯個人簡介
  'manager', // 擔任經理人的資格
] as const;

export const SpecialUser = {
  NONE: '!none',
  SYSTEM: '!system',
  FSC: '!FSC',
};

export const UserRole = {
  SUPER_ADMIN: {
    name: 'superAdmin',
    displayName: '超級管理員',
  },
  GENERAL_MANAGER: {
    name: 'generalManager',
    displayName: '營運總管',
  },
  DEVELOPER: {
    name: 'developer',
    displayName: '工程部成員',
    manageableBy: ['GENERAL_MANAGER'],
  },
  PLANNER: {
    name: 'planner',
    displayName: '企劃部成員',
    manageableBy: ['GENERAL_MANAGER'],
  },
  FSC_MEMBER: {
    name: 'fscMember',
    displayName: '金管會成員',
    manageableBy: ['GENERAL_MANAGER'],
  },
};

export const ValidateMethod = ['Google', 'PTT', 'Bahamut'] as const;

export type ValidateType = (typeof ValidateMethod)[number];

export const profileSchema = z.object({
  /** 使用者名稱 */
  name: z.string(),
  /** 使用者的系統權限組 */
  roles: z
    .string()
    .array()
    .refine((val) => {
      if (val.length > 0) {
        const validRoles = Object.values(UserRole).map((role) => role.name);

        return val.every((v) => validRoles.includes(v));
      }
      return true;
    }),
  /** 帳號驗證來源 */
  validateType: z.enum(ValidateMethod),
  /** 被禁止的權限 */
  ban: z.enum(BanTypeList).array(),
  /** 未登入天數次數紀錄 */
  noLoginDayCount: integer.min(0),
  lastSeasonTotalWealth: integer.default(0),
  /** 金錢數量 */
  money: integer,
  /** 消費券的數量 */
  vouchers: integer.min(0).default(7000),
  /** 推薦票數量 */
  voteTickets: integer.min(0).default(0),
  /** 是否處於渡假模式 */
  isInVacation: z.boolean().default(false),
  /** 是否將要收假 */
  isEndingVacation: z.boolean().default(false),
  /** 各類石頭的數量 */
  stones: z
    .object(
      zipObject(
        stoneTypeList,
        stoneTypeList.map(() => integer.min(0).default(0)),
      ),
    )
    .partial()
    .default({}),
});

const statusSchema = z.object({
  /** 最後上線資訊 */
  lastLogin: z
    .object({
      /** 日期 */
      date: datetime.nullish(),
      /** IP 地址 */
      ipAddr: z.string().nullish(),
      /** 使用瀏覽器 */
      userAgent: z.string().nullish(),
    })
    .nullish(),
});

const aboutSchema = z.object({
  description: z.string().max(300).default(''),
  picture: z.string().url().nullish(),
});

const schema = z.object({
  _id: objectId,
  /** 使用者 PTT 帳號名稱 */
  username: z.string().nullish(),
  /** 驗證成功日期 */
  createdAt: datetime,
  profile: profileSchema,
  status: statusSchema.nullish(),
  about: aboutSchema.optional().default({
    description: '',
  }),
  favorite: itemId.array().default([]),
});

export const userSchema = schema;

export function getDBUsers(db: Db) {
  return db.collection('users');
}
