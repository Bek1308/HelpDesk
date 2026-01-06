// src/shared/api-services/bonus-system/interface/bonus-system-user-dto.interface.ts

export interface IBonusSystemUserDto {
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
}

export interface ICreateBonusSystemUserDto {
    bonusSystemId: number;
    userId: number;
}

export interface IEditBonusSystemUserDto extends ICreateBonusSystemUserDto {
    id: number;
}

export interface IGetAllBonusSystemUsersInput {
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
}