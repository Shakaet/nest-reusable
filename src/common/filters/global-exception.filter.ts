import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorMessages: { path: string; message: string }[] = [];

    // ১. NestJS HttpException (Bad Request, Unauthorized, Forbidden ইত্যাদি)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorMessages = [{ path: request.originalUrl, message: exceptionResponse }];
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, any>;

        // DTO Validation Pipe এরর (message সাধারণত একটি string array হয়)
        if (Array.isArray(resObj.message)) {
          message = 'Validation Error';
          errorMessages = resObj.message.map((msg: string) => ({
            path: request.originalUrl,
            message: msg,
          }));
        } else {
          message = resObj.message || exception.message;
          errorMessages = [
            {
              path: request.originalUrl,
              message,
            },
          ];
        }
      }
    } 
    // ২. সাধারণ জাভাস্ক্রিপ্ট / Mongoose / ডাটাবেজ এরর (Uncaught Exceptions)
    else if (exception instanceof Error) {
      message = exception.message; // যেমন: "Schema hasn't been registered for model 'adminroles'"
      errorMessages = [
        {
          path: request.originalUrl,
          message: `${exception.name}: ${exception.message}`,
        },
      ];

      // টার্মিনালেও পুরো স্ট্যাক ট্রেস প্রিন্ট করে দেবে
      this.logger.error(
        `[${request.method}] ${request.originalUrl} - ${exception.message}`,
        exception.stack,
      );
    }

    // রেসপন্স সেন্ড করা
    response.status(status).json({
      success: false,
      message,
      errorMessages,
      // stack: process.env.NODE_ENV !== 'production' && exception instanceof Error ? exception.stack : undefined,
    });
  }
}