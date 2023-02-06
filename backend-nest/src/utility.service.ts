import { Injectable } from '@nestjs/common';

export interface MyResponse<T> {
    success: boolean;
    data?: T;
    error?: any;

}

@Injectable()
export class UtilityService {

}
