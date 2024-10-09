import { NestFactory } from '@nestjs/core';
import 'dotenv/config';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Test seeder should NOT be run in production! Exiting...');
}

(async () => {
  // Environment check to prevent running on production

  /* const app = await NestFactory.createApplicationContext(SeederModule); */
  /* const seeder = app.get(TestSeederService); */

  try {
    console.log('Seeding test data...');
    /* await seeder.seedAll(); */
    console.log('Test seeding completed!');
  } catch (error) {
    console.error('Error during test seeding:', error);
  } finally {
    /* await app.close(); */
  }
})();
