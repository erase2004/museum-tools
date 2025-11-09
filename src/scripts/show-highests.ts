import z from 'zod';
import yargs from 'yargs';
import { MongoClient } from 'mongodb';
import { DB_URI } from '@/configs/index';
import { toDBName } from '@/utils/helper';

const argvs = yargs(Bun.argv)
  .scriptName('show-highests')
  .usage('$0 <options>', "Show highest companies' info")
  .options({
    n: {
      alias: 'db-number',
      demandOption: true,
      type: 'number',
      describe: 'database number',
    },
    t: {
      alias: 'take',
      demandOption: false,
      default: 3,
      type: 'number',
      describe: 'amount of companies to show',
    },
  })
  .parse();

const companySchema = z.object({
  _id: z.coerce.string(),
  /** 公司名稱 */
  companyName: z.string().min(1).max(100),
  /** 大圖 */
  pictureBig: z.string().url().optional(),
});

async function main() {
  const { n, t: take } = await argvs;
  const dbName = toDBName(n);
  const client = new MongoClient(DB_URI);
  const dbCompanies = client.db(dbName).collection('companies');

  const companies = await z
    .promise(companySchema.array())
    .parseAsync(
      dbCompanies.find({ isSeal: false }, { sort: { lastPrice: -1 }, limit: take }).toArray(),
    );

  console.debug(`[${dbName}] Results`);
  console.debug(companies);
}

main().then(() => {
  console.debug('Finished');
  process.exit(0);
});
