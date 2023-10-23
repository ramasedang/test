import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const start = Date.now();

async function main() {
  console.log('Start seeding ARA 5.0');
  fs.readFile(__dirname + '/data/provinsi.csv', 'utf8', async (err, data) => {
    console.log('Seed provinsi ...');
    if (err) {
      console.error(err);
      return;
    }
    const rows = data.split('\n');
    for (const row of rows) {
      if (row.startsWith('id')) {
        continue;
      }
      if (row === '') {
        continue;
      }
      const provinsi = await prisma.provinsi.findFirst({
        where: {
          id: parseInt(row.split(',')[0]),
        },
      });
      if (provinsi) {
        continue;
      }
      const [id, nama] = row.split(',');
      await prisma.provinsi.create({
        data: {
          id: parseInt(id),
          nama: nama,
        },
      });
    }
  });

  fs.readFile(
    __dirname + '/data/kabupatenkota.csv',
    'utf8',
    async (err, data) => {
      console.log('Seed kabupaten ...');
      if (err) {
        console.error(err);
        return;
      }
      const rows = data.split('\n');
      for (const row of rows) {
        if (row.startsWith('id')) {
          continue;
        }
        if (row === '') {
          continue;
        }
        const kabupaten = await prisma.kabupaten.findFirst({
          where: {
            id: parseInt(row.split(',')[0]),
          },
        });
        if (kabupaten) {
          continue;
        }
        const [id, provinsiId, nama] = row.split(',');
        await prisma.kabupaten.create({
          data: {
            id: parseInt(id),
            nama: nama,
            provinsiId: parseInt(provinsiId),
          },
        });
      }
    },
  );
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
