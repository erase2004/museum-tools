/**
 * 請在執行以下 mongo script 後再執行本程式:
 *
 *  src/mongo-scripts/043-rename-name-to-companyName-in-companyArchive.js
 */

import z from 'zod';
import { type Collection, type Db, MongoClient } from 'mongodb';
import { DB_URI } from '@/configs/index';
import { map, range, zipObject } from 'lodash-es';
import { toDBName, toRoundName } from '@/utils/helper';

const companySchema = z.object({
  _id: z.coerce.string(),
  companyName: z.string(),
});

type Company = z.infer<typeof companySchema>;

async function main() {
  const client = new MongoClient(DB_URI);

  const companyDict: Record<string, string> = {};
  const roundCompanies: Record<string, Company[]> = {};

  for (let n = 1; n <= 6; n++) {
    const dbName = toDBName(n);
    const dbCompanyArchive = client.db(dbName).collection('companyArchive');

    const companies = await z
      .promise(companySchema.array())
      // @ts-expect-error: it should be ok
      .parseAsync(dbCompanyArchive.find({}, { _id: true, companyName: true }).toArray());

    roundCompanies[n] = companies;

    const dict = zipObject(map(companies, 'companyName'), map(companies, '_id'));
    Object.assign(companyDict, dict);
  }

  console.debug(`There are ${Object.keys(companyDict).length} unique companies.`);

  const tasks = range(1, 6).map((i) =>
    updateRound(client, i, roundCompanies[i] ?? [], companyDict),
  );

  await Promise.allSettled(tasks);
}

async function updateRound(
  client: MongoClient,
  roundIndex: number,
  companies: Company[],
  companyDict: Record<string, string>,
) {
  const roundName = toRoundName(roundIndex);
  const updates: Record<string, string> = {};

  companies.forEach((company) => {
    const { _id: id, companyName } = company;

    const to = companyDict[companyName];
    if (to && to !== id) {
      updates[id] = to;
    }
  });

  const toBeUpdatedAmount = Object.keys(updates).length;
  console.debug(`[${roundName}] There are ${toBeUpdatedAmount} entries to be updated.`);

  if (!toBeUpdatedAmount) return;

  try {
    const connection = client.db(toDBName(roundIndex));
    const replaced: Record<string, string> = {};
    const switched: Record<string, string> = {};

    // _id 的更換需要搭配刪除和插入操作
    for (const [from, to] of Object.entries(updates)) {
      {
        // dbCompanyArchive
        const dbCompanyArchive = connection.collection('companyArchive');

        const target = await dbCompanyArchive.findOne({
          // @ts-expect-error: from is valid ObjectId
          _id: to,
        });

        await dbCompanyArchive.deleteOne({
          // @ts-expect-error: from is valid ObjectId
          _id: to,
        });

        const source = await dbCompanyArchive.findOne({
          // @ts-expect-error: from is valid ObjectId
          _id: from,
        });

        await dbCompanyArchive.deleteOne({
          // @ts-expect-error: from is valid ObjectId
          _id: from,
        });

        await dbCompanyArchive.insertOne({
          ...source,
          // @ts-expect-error: from is valid ObjectId
          _id: to,
        });

        if (target) {
          await dbCompanyArchive.insertOne({
            ...target,
            // @ts-expect-error: from is valid ObjectId
            _id: from,
          });

          switched[from] = to;
        } else {
          replaced[from] = to;
        }
      }

      {
        // dbCompanies
        const dbCompanies = connection.collection('companies');

        const target = await dbCompanies.findOne({
          // @ts-expect-error: from is valid ObjectId
          _id: to,
        });

        await dbCompanies.deleteOne({
          // @ts-expect-error: from is valid ObjectId
          _id: to,
        });

        const source = await dbCompanies.findOne({
          // @ts-expect-error: from is valid ObjectId
          _id: from,
        });

        await dbCompanies.deleteOne({
          // @ts-expect-error: from is valid ObjectId
          _id: from,
        });

        await dbCompanies.insertOne({
          ...source,
          // @ts-expect-error: from is valid ObjectId
          _id: to,
        });

        if (target) {
          await dbCompanies.insertOne({
            ...target,
            // @ts-expect-error: from is valid ObjectId
            _id: from,
          });
        }
      }
    }

    console.debug(
      `[${roundName}] There are ${Object.keys(switched).length} switched and ${Object.keys(replaced).length} replaced.`,
    );

    const tasks = [];

    {
      const dbViolationCases = connection.collection('violationCases');
      tasks.push(updateViolationCases(roundName, dbViolationCases, switched, true));
      tasks.push(updateViolationCases(roundName, dbViolationCases, replaced));
    }

    {
      const arenaSchema = z.object({
        _id: z.coerce.string(),
      });
      const dbArena = connection.collection('arena');
      const arenas = await z.promise(arenaSchema.array()).parseAsync(dbArena.find({}).toArray());

      for (const arena of arenas) {
        const collectionName = `arenaLog${arena._id}`;
        tasks.push(updateArenaLogs(roundName, connection, collectionName, switched, true));
        tasks.push(updateArenaLogs(roundName, connection, collectionName, replaced));
      }

      tasks.push(updateArena(roundName, dbArena, switched, true));
      tasks.push(updateArena(roundName, dbArena, replaced));
    }

    tasks.push(updateCompanyIdField(roundName, connection, 'companyStones', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'companyStones', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'products', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'products', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'price', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'price', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'employees', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'employees', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'directors', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'directors', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'vips', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'vips', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'userOwnedProducts', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'userOwnedProducts', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'log', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'log', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'arenaFighters', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'arenaFighters', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'rankCompanyValue', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'rankCompanyValue', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'rankCompanyProfit', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'rankCompanyProfit', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'rankCompanyPrice', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'rankCompanyPrice', replaced));

    tasks.push(updateCompanyIdField(roundName, connection, 'rankCompanyCapital', switched, true));
    tasks.push(updateCompanyIdField(roundName, connection, 'rankCompanyCapital', replaced));

    await Promise.allSettled(tasks);
  } catch (error) {
    console.error(error);
  }
}

async function updateCompanyIdField(
  roundName: string,
  connection: Db,
  collectionName: string,
  fromToMap: Record<string, string>,
  switched?: boolean,
) {
  if (!Object.keys(fromToMap).length) return;

  const collection = connection.collection(collectionName);
  let updateCount = 0;

  if (switched) {
    const tempId = 'temp-company-id';
    const bulkOperations = [];

    for (const [from, to] of Object.entries(fromToMap)) {
      bulkOperations.push({
        updateMany: {
          filter: { companyId: to },
          update: {
            $set: {
              companyId: tempId,
            },
          },
        },
      });

      bulkOperations.push({
        updateMany: {
          filter: { companyId: from },
          update: {
            $set: {
              companyId: to,
            },
          },
        },
      });

      bulkOperations.push({
        updateMany: {
          filter: { companyId: tempId },
          update: {
            $set: {
              companyId: from,
            },
          },
        },
      });
    }

    const result = await collection.bulkWrite(bulkOperations, { ordered: true });
    updateCount += result.modifiedCount;
  } else {
    const bulkOperations = [];

    for (const [from, to] of Object.entries(fromToMap)) {
      bulkOperations.push({
        updateMany: {
          filter: { companyId: from },
          update: {
            $set: {
              companyId: to,
            },
          },
        },
      });
    }

    const result = await collection.bulkWrite(bulkOperations);
    updateCount += result.modifiedCount;
  }

  console.debug(
    `[${roundName}] There are ${updateCount} entries in \`${collectionName}\` got updated.`,
  );
}

async function updateViolationCases(
  roundName: string,
  collection: Collection,
  fromToMap: Record<string, string>,
  switched?: boolean,
) {
  if (!Object.keys(fromToMap).length) return;

  let updateCount = 0;

  if (switched) {
    const tempId = 'temp-company-id';
    const bulkOperations = [];

    for (const [from, to] of Object.entries(fromToMap)) {
      bulkOperations.push({
        updateMany: {
          filter: {
            'violators.violatorType': 'company',
            'violators.violatorId': to,
          },
          update: {
            $set: {
              'violators.$[i].violatorId': tempId,
            },
          },
          arrayFilters: [
            {
              'i.violatorType': 'company',
              'i.violatorId': to,
            },
          ],
        },
      });

      bulkOperations.push({
        updateMany: {
          filter: {
            'violators.violatorType': 'company',
            'violators.violatorId': from,
          },
          update: {
            $set: {
              'violators.$[i].violatorId': to,
            },
          },
          arrayFilters: [
            {
              'i.violatorType': 'company',
              'i.violatorId': from,
            },
          ],
        },
      });

      bulkOperations.push({
        updateMany: {
          filter: {
            'violators.violatorType': 'company',
            'violators.violatorId': tempId,
          },
          update: {
            $set: {
              'violators.$[i].violatorId': from,
            },
          },
          arrayFilters: [
            {
              'i.violatorType': 'company',
              'i.violatorId': tempId,
            },
          ],
        },
      });
    }

    const result = await collection.bulkWrite(bulkOperations, { ordered: true });
    updateCount += result.modifiedCount;
  } else {
    const bulkOperations = [];

    for (const [from, to] of Object.entries(fromToMap)) {
      bulkOperations.push({
        updateMany: {
          filter: {
            'violators.violatorType': 'company',
            'violators.violatorId': from,
          },
          update: {
            $set: {
              'violators.$[i].violatorId': to,
            },
          },
          arrayFilters: [
            {
              'i.violatorType': 'company',
              'i.violatorId': from,
            },
          ],
        },
      });
    }

    const result = await collection.bulkWrite(bulkOperations);
    updateCount += result.modifiedCount;
  }

  console.debug(
    `[${roundName}] There are ${updateCount} entries in \`violationCases\` got updated.`,
  );
}

async function updateArenaLogs(
  roundName: string,
  connection: Db,
  collectionName: string,
  fromToMap: Record<string, string>,
  switched?: boolean,
) {
  if (!Object.keys(fromToMap).length) return;

  const collection = connection.collection(collectionName);
  let updateCount = 0;

  if (switched) {
    const tempId = 'temp-company-id';
    const bulkOperations = [];

    for (const [from, to] of Object.entries(fromToMap)) {
      bulkOperations.push({
        updateMany: {
          filter: {
            companyId: to,
          },
          update: {
            $set: {
              'companyId.$[i]': tempId,
            },
          },
          arrayFilters: [
            {
              i: to,
            },
          ],
        },
      });

      bulkOperations.push({
        updateMany: {
          filter: {
            companyId: from,
          },
          update: {
            $set: {
              'companyId.$[i]': to,
            },
          },
          arrayFilters: [
            {
              i: from,
            },
          ],
        },
      });

      bulkOperations.push({
        updateMany: {
          filter: {
            companyId: tempId,
          },
          update: {
            $set: {
              'companyId.$[i]': from,
            },
          },
          arrayFilters: [
            {
              i: tempId,
            },
          ],
        },
      });
    }

    const result = await collection.bulkWrite(bulkOperations, { ordered: true });
    updateCount += result.modifiedCount;
  } else {
    const bulkOperations = [];

    for (const [from, to] of Object.entries(fromToMap)) {
      bulkOperations.push({
        updateMany: {
          filter: {
            companyId: from,
          },
          update: {
            $set: {
              'companyId.$[i]': to,
            },
          },
          arrayFilters: [
            {
              i: from,
            },
          ],
        },
      });
    }

    const result = await collection.bulkWrite(bulkOperations);
    updateCount += result.modifiedCount;
  }

  console.debug(
    `[${roundName}] There are ${updateCount} entries in \`${collectionName}\` got updated.`,
  );
}

async function updateArena(
  roundName: string,
  collection: Collection,
  fromToMap: Record<string, string>,
  switched?: boolean,
) {
  if (!Object.keys(fromToMap).length) return;

  let updateCount = 0;

  if (switched) {
    const tempId = 'temp-company-id';
    const bulkOperations = [];

    for (const [from, to] of Object.entries(fromToMap)) {
      bulkOperations.push({
        updateMany: {
          filter: {
            shuffledFighterCompanyIdList: to,
          },
          update: {
            $set: {
              'shuffledFighterCompanyIdList.$[i]': tempId,
            },
          },
          arrayFilters: [
            {
              i: to,
            },
          ],
        },
      });

      bulkOperations.push({
        updateMany: {
          filter: {
            shuffledFighterCompanyIdList: from,
          },
          update: {
            $set: {
              'shuffledFighterCompanyIdList.$[i]': to,
            },
          },
          arrayFilters: [
            {
              i: from,
            },
          ],
        },
      });

      bulkOperations.push({
        updateMany: {
          filter: {
            shuffledFighterCompanyIdList: tempId,
          },
          update: {
            $set: {
              'shuffledFighterCompanyIdList.$[i]': from,
            },
          },
          arrayFilters: [
            {
              i: tempId,
            },
          ],
        },
      });
    }

    const result = await collection.bulkWrite(bulkOperations, { ordered: true });
    updateCount += result.modifiedCount;
  } else {
    const bulkOperations = [];

    for (const [from, to] of Object.entries(fromToMap)) {
      bulkOperations.push({
        updateMany: {
          filter: {
            shuffledFighterCompanyIdList: from,
          },
          update: {
            $set: {
              'shuffledFighterCompanyIdList.$[i]': to,
            },
          },
          arrayFilters: [
            {
              i: from,
            },
          ],
        },
      });
    }

    const result = await collection.bulkWrite(bulkOperations);
    updateCount += result.modifiedCount;
  }

  console.debug(`[${roundName}] There are ${updateCount} entries in \`arena\` got updated.`);
}

main().then(() => {
  console.debug('Finished');
  process.exit(0);
});
