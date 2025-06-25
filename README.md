## Getting Started

For initial development setup

```bash
cp dot-env-template .env # or manually create file called .env in root of directory and copy contents of dot-env-template to it.
yarn
yarn prisma migrate dev # this will create dev.db file inside prisma folder
yarn run dev
```

