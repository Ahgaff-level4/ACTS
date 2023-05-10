import { ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import {  User } from '../../interfaces';
export interface MyResponse<T> {
    success: boolean;
    data?: T;
    error?: any;
}

@Injectable()
export class UtilityService {
    /**
     * 
     * @param parent oject with property `phone1,phone2,phone3,..., phone10` OR object that contains `parent` property as `child.parent.phone1...`
     * @returns return same object but transform `phoneN` to array in property `phone:[phone1Value,phone2Value,...]`
     */
    public phoneN2array(hasIsParent) {
        let parent;
        if (typeof hasIsParent.phone1 === 'object' || typeof hasIsParent.phone1 === 'string')
            parent = hasIsParent;
        else if (typeof hasIsParent.parent === 'object')
            parent = hasIsParent.parent;
        else return hasIsParent;

        const phones = [];
        for (let i = 1; i <= 10; i++) {
            if (parent['phone' + i])
                phones.push(parent['phone' + i])
            delete parent['phone' + i];
        }
        parent.phone = phones;
        return hasIsParent;
    }

    /**
     * if parent do not have property phone or it is equal to null then it will delete `parent.phone` and return it.
     * @param parent object with property of `phone` that has array of phones number
     * @returns same object transform `phone` values to properties as `parent will equal {...,phone1:phone[0],phone2:phone[0],...}`
     */
    public array2phoneN(parent) {
        if (parent.phone === undefined || parent.phone === null) {
            delete parent.phone;
            return parent;
        }
        for (let i = 0; i < 10; i++) {
            if (parent.phone[i])
                parent['phone' + (i + 1)] = parent.phone[i];
            else parent['phone' + (i + 1)] = null;
            delete parent.phone[i];
        }
        delete parent.phone;
        return parent;
    }
}

/**
 * Resources used instead of plain string; todo add languages
 */
export const R = {
    string: {
        somethingWentWrong: 'Something went wrong!',
        insufficientPrivilege: `You don't have sufficient privilege to do this action!`,
        loggedInSuccessfully: 'Logged in successfully',
        loggedOutSuccessfully: 'Logged out successfully',
        invalidUsernameOrPassword: 'Invalid username or password!',
        onlyAdminTeacher: 'Only Admin and Teacher are authorized!',
        onlyParent:'Only Parent is authorized!',
        mustLogin:'You must login!',
        duplicateEntry:`There is duplicated value should be unique!`,
        invalidRole:(roleName:string)=>`Invalid role! Role ${roleName} dose not exist!`
    }

}



/**
 * Used to extract `User` object from `req.session.user` or set user param to undefined
 */
export const UserSession = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): User | undefined => {
        const request = ctx.switchToHttp().getRequest();
        if (request.session && request.session.user)
            return request.session.user;
        return undefined;
    },
);

/**
 * Used to extract `User` object from `req.session.user` if not found will throw UnauthorizedException with 'must login' message
 */
export const UserMust = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    if (req && req.session && req.session.user)
        return req.session.user;
    throw new UnauthorizedException(R.string.mustLogin)
})