# museum-tools

Tools for [ACGN stock museum](https://github.com/erase2004/acgn-stock-museum)

- - -

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run 
```

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

- - -

## Tools

### [import-user](./src/scripts/import-user.ts)

Import user from MongoDB into Firestore.

Run with `bun run import-user --help` to see more details.


### [show-highests](./src//cripts//show-highests.ts)

Show highest companies' info

Run with `bun run show-highests --help` to see more details.


### [fix-company-id-inconsistency](./src/scripts/fix-company-id-inconsistency.ts)

Fix company id inconsistency issues between `round1` to `round6`.

Please apply db migration ([043-rename-name-to-companyName-in-companyArchive](./src/mongo-scripts/043-rename-name-to-companyName-in-companyArchive.js)) before execute the script.


### [backup.sh](./src/scripts//backup.sh)

Backup single MongoDB database.

Run with `./backup.sh [DB_NAME]`.

`DB_NAME` should be `{string}-{number}` format.


### [restore.sh](./src/scripts/restore.sh)

Restore single MongoDB database from compressed backup file.

Run with `./retore.sh [COMPRESSED_DB_BACKUP_FILE_NAME]`.

`COMPRESSED_DB_BACKUP_FILE_NAME` should be `.tar.gz` file extension


### [build.sh](./src/scripts/build.sh)

Build single Meteor.js based museum server instance.

Run with `./build.sh [PROJECT_DIRECTORY]`.

`PROJECT_DIRECTORY` should be root directory of source code.