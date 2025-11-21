import z from 'zod';
import yargs from 'yargs';
import { MongoClient } from 'mongodb';
import { entries, groupBy, isUndefined, keyBy, pick, range } from 'lodash-es';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_URI } from '@/configs/index';
import { toDBName, toRoundName } from '@/utils/helper';
import {
  companySchema,
  directorSchema,
  userSchema,
  ownProductSchema,
  seasonSchema,
  getDBUsers,
  getDBDirectors,
  getDBSeason,
  getDBUserOwnProducts,
  getDBCompanies,
} from '@/utils/schema';

const argvs = yargs(Bun.argv)
  .scriptName('import-user')
  .usage('$0 <options>', 'Import user from MongoDB into Firestore')
  .options({
    n: {
      alias: 'db-number',
      demandOption: false,
      type: 'number',
      describe: 'database number of single target',
    },
    s: {
      alias: 'start-db-number',
      demandOption: false,
      type: 'number',
      describe: 'start database number of multiple targets',
    },
    e: {
      alias: 'end-db-number',
      demandOption: false,
      type: 'number',
      describe: 'end database number of multiple targets',
    },
  })
  .conflicts({
    n: ['s', 'e'],
  })
  .implies({
    s: 'e',
    e: 's',
  })
  .check((argv) => {
    const { n, s, e } = argv;

    if (isUndefined(n) && isUndefined(s) && isUndefined(e)) {
      throw new Error('At least one option should be set');
    }
    return true;
  })
  .parse();

initializeApp({
  credential: cert('./secrets/serviceAccountKey.json'),
});

let dbNames: string[];
let targetDbNames: string[];

const { n, s, e } = await argvs;
if (n) {
  dbNames = [n].map(toDBName);
  targetDbNames = [n].map(toRoundName);
} else {
  const ranges = range(s!, e!);
  dbNames = ranges.map(toDBName);
  targetDbNames = ranges.map(toRoundName);
}

async function main() {
  const client = new MongoClient(DB_URI);
  const firestore = getFirestore();

  async function generateTask(dbName: string, targetDbName: string) {
    const connection = client.db(dbName);

    try {
      // users
      const dbUsers = getDBUsers(connection);
      const users = await z.promise(userSchema.array()).parseAsync(dbUsers.find({}).toArray());

      // user own stocks
      const dbDirectors = getDBDirectors(connection);
      const ownStockList =
        (await z.promise(directorSchema.array()).parseAsync(dbDirectors.find({}).toArray())) ?? [];
      const fullMap = groupBy(ownStockList, 'u');
      const ownStockMap = entries(fullMap).reduce(
        (m, [userId, values]) => {
          m[userId] = values.map((v) => pick(v, ['c', 's']));
          return m;
        },
        {} as Record<string, { c: string; s: number }[]>,
      );

      // user own product values
      const dbSeason = getDBSeason(connection);
      const lastSeason = await z
        .promise(seasonSchema)
        .parseAsync(dbSeason.findOne({}, { sort: { beginDate: -1 } }));
      const dbUserOwnedProduct = getDBUserOwnProducts(connection);
      const list =
        (await z
          .promise(ownProductSchema.array())
          .parseAsync(dbUserOwnedProduct.find({ seasonId: lastSeason._id }).toArray())) ?? [];
      const dict = groupBy(list, 'userId');
      const ownProductValueMap = entries(dict).reduce(
        (userMap, [userId, items]) => {
          userMap[userId] = items.reduce(
            (totalMap, item) => {
              const companyId = item.companyId;

              totalMap[companyId] = (totalMap[companyId] || 0) + item.price * item.amount;
              return totalMap;
            },
            {} as Record<string, number>,
          );

          return userMap;
        },
        {} as Record<string, Record<string, number>>,
      );

      // company
      const dbCompanies = getDBCompanies(connection);
      const companyList =
        (await z.promise(companySchema.array()).parseAsync(dbCompanies.find({}).toArray())) ?? [];
      const companyMap = keyBy(companyList, '_id');

      console.debug(`[${dbName}] There are ${users.length} users`);

      const collectionRef = firestore.collection(targetDbName);
      for (const user of users) {
        const id = user._id;
        const existedItem = await collectionRef.where('_id', '==', id).get();

        const data = {
          ...user,
          ownStock: ownStockMap[id] ?? {},
          productValue: ownProductValueMap[id] ?? {},
          favorite: [],
          favoriteV2: user.favorite.map((id) => companyMap[id]),
        };

        if (existedItem.empty) {
          await collectionRef.add(data);
        } else {
          await collectionRef.doc(existedItem.docs[0]!.id).update(data);
        }
      }

      console.debug(`[${dbName}] Finished adding users`);
    } catch (err) {
      console.error(`[${dbName}] Encountered error while adding user`);
      console.error(err);
    }
  }

  const tasks = dbNames.map(
    async (dbName, index) => await generateTask(dbName, targetDbNames[index]!),
  );

  await Promise.allSettled(tasks);
}

main().then(() => {
  console.debug('Finished');
  process.exit(0);
});
