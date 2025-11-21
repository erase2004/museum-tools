import type { Db } from 'mongodb';

export function getDBMigrations(db: Db) {
  return db.collection('migrations');
}
