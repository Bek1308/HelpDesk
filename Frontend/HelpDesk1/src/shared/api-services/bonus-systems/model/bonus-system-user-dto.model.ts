// src/shared/api-services/bonus-system/model/bonus-system-user-dto.model.ts

import {
    IBonusSystemUserDto,
    ICreateBonusSystemUserDto,
    IEditBonusSystemUserDto,
    IGetAllBonusSystemUsersInput
} from '../interface/bonus-system-user-dto.interface';

export class BonusSystemUserDto implements IBonusSystemUserDto {
    id: number;
    bonusSystemId: number;
    bonusSystemName?: string;
    bonusSystemDescription?: string;
    bonusSystemAmount: number;
    bonusSystemIsActive: boolean;
    userId: number;
    userFullName?: string;
    userEmail?: string;
    userName?: string;
    userSurname?: string;
    creationTime: string;
    lastModificationTime?: string;

    constructor(data?: IBonusSystemUserDto) {
        if (data) Object.assign(this, data);
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data['id'];
            this.bonusSystemId = _data['bonusSystemId'];
            this.bonusSystemName = _data['bonusSystemName'];
            this.bonusSystemDescription = _data['bonusSystemDescription'];
            this.bonusSystemAmount = _data['bonusSystemAmount'];
            this.bonusSystemIsActive = _data['bonusSystemIsActive'];
            this.userId = _data['userId'];
            this.userFullName = _data['userFullName'];
            this.userEmail = _data['userEmail'];
            this.userName = _data['userName'];
            this.userSurname = _data['userSurname'];
            this.creationTime = _data['creationTime'];
            this.lastModificationTime = _data['lastModificationTime'];
        }
    }

    static fromJS(data: any): BonusSystemUserDto {
        const result = new BonusSystemUserDto();
        result.init(data);
        return result;
    }
}

export class CreateBonusSystemUserDto implements ICreateBonusSystemUserDto {
    bonusSystemId: number;
    userId: number;

    constructor(data?: any) {
        if (data) {
            this.bonusSystemId = data.bonusSystemId;
            this.userId = data.userId;
        }
    }
}

export class EditBonusSystemUserDto extends CreateBonusSystemUserDto implements IEditBonusSystemUserDto {
    id: number;

    constructor(data?: any) {
        super(data);
        this.id = data?.id || 0;
    }
}

export class GetAllBonusSystemUsersInput implements IGetAllBonusSystemUsersInput {
    keyword?: string;
    bonusSystemId?: number;
    userId?: number;
    isActive?: boolean;
    amountMin?: number;
    amountMax?: number;
    creationTimeStart?: string;
    creationTimeEnd?: string;
    sorting?: string;
    maxResultCount?: number;
    skipCount?: number;

    constructor(data?: any) {
        if (data) Object.assign(this, data);
    }
}