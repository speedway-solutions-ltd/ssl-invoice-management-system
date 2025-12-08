import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as compression from 'compression';
import helmet from 'helmet';
import { BadRequestException, Logger, ValidationError, ValidationPipe, VersioningType } from '@nestjs/common';
import * as morgan from 'morgan'; // Import morgan


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware to fix security headers for development
  app.use((req: Request, res: Response, next: NextFunction) => {
    const host = req.headers.host || '';
    // Only apply fixes for development URLs
    if (host.includes('192.168.0.103') || host.includes('localhost')) {
      // Remove headers that cause CORS/HTTPS issues on HTTP
      res.removeHeader('Cross-Origin-Opener-Policy');
      res.removeHeader('Cross-Origin-Embedder-Policy');
      res.removeHeader('Origin-Agent-Cluster');
    }
    next();
  });

  // CORS configuration
  app.enableCors({
    origin: '*', // [`http://localhost:${PORT}`, `http://192.168.0.103:${PORT}`],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
  });

  app.use(compression());
  app.useLogger(new Logger());
  // Apply morgan globally
  app.use(morgan('dev')); // Use 'dev' format for concise, colored output
  if (process.env.NODE_ENV === 'production') app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addServer(`http://localhost:${PORT}`, 'Localhost')
    .addServer(`http://192.168.0.103:${PORT}`, 'Network IP')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI setup with HTTP-only configuration
  SwaggerModule.setup('api/docs', app, document, {
    // swaggerOptions: {
    //   // Force HTTP and relative URLs
    //   url: '/api/docs-json',
    //   validatorUrl: null,
    //   supportedSubmitMethods: [],
    //   // Disable HTTPS upgrades
    //   schemes: ['http'],
    //   // Custom script to fix protocol issues
    //   onComplete: () => {
    //     // This runs after Swagger UI loads
    //     console.log('Swagger UI loaded successfully');
    //   },
    // },
    // customSiteTitle: 'API Docs',
    // customCss: `
    //   /* Custom styles */
    //   .swagger-ui .topbar { display: none !important; }
    //   .swagger-ui .info { margin: 20px 0 !important; }
    // `,
    // customfavIcon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>',
  });


  // Global validation pipe with custom error formatting
  const formatErrors = (errors: ValidationError[]) => {
    const result = [] as any[];
    const flatten = (errs: ValidationError[], parentPath = '') => {
      for (const err of errs) {
        const propertyPath = parentPath ? `${parentPath}.${err.property}` : err.property;
        if (err.constraints) {
          result.push({ field: propertyPath, errors: Object.values(err.constraints) });
        }
        if (err.children && err.children.length) {
          flatten(err.children, propertyPath);
        }
      }
    };
    flatten(errors);
    return result;
  };

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      const details = formatErrors(validationErrors);
      return new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details,
      });
    },
  }));

  // Start server
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 Server running on:`);
  console.log(`   Local:  http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.0.112:${PORT}`);
  console.log(`📚 Swagger Docs: http://192.168.0.112:${PORT}/api/docs`);
}

bootstrap();