import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string | null;
  data?: T | null;
  totalData?: number | null;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        const responseData: IApiResponse<T> = {
          statusCode,
          success: true,
          message: result?.message ?? null,
        };

        if (result?.data !== undefined) {
          responseData.data = result.data;
        } else if (result !== undefined && !result?.message) {
          responseData.data = result;
        }

        if (result?.totalData !== undefined) {
          responseData.totalData = result.totalData;
        }

        return responseData;
      }),
    );
  }
}