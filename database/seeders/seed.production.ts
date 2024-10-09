import { NestFactory } from '@nestjs/core';
import 'dotenv/config';

if (process.env.NODE_ENV !== 'production') {
  throw new Error('Production seed required to run in production! Exiting...');
}

(async () => {
  // Environment check to prevent running on production

  /* const app = await NestFactory.createApplicationContext(SeederModule); */
  /* const seeder = app.get(TestSeederService); */

  try {
    console.log('Seeding production data...');
    /* await seeder.seedAll(); */
    console.log('Production seeding completed!');
  } catch (error) {
    console.error('Error during production seeding:', error);
  } finally {
    /* await app.close(); */
  }
})();
