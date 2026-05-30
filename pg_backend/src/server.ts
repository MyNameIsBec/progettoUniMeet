import 'dotenv/config';
import app from './app';
import path from 'path';
import fs from 'fs';
import { prisma } from './prisma/client';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is required');
  process.exit(1);
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const swaggerAutogen = require('swagger-autogen')();
const swaggerUi = require('swagger-ui-express');

const outputFile = path.join(__dirname, '../swagger_output.json');
const isTs = fs.existsSync(path.join(__dirname, './routes/auth.routes.ts'));
const ext = isTs ? '*.ts' : '*.js';
const endpointsFiles = [path.join(__dirname, `./routes/${ext}`)];

const doc = {
  info: {
    title: 'API UniMeet',
    version: '1.0.0',
    description: 'Documentazione API ricevimenti docenti, prenotazioni, bacheche',
  },
  host: 'localhost:5000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
};

const PORT = process.env.PORT ?? 5000;

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  const swaggerDocument = require(outputFile);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});
