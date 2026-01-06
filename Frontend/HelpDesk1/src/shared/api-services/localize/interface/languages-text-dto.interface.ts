export interface ILanguagesTextDto {
    id: number;
    languageName: string;
    soure: string;
    key: string;
    value: string;
}


export interface ICreateLanguagesTextDto {
    languageName: string;
    key: string;
    value: string;
}

export interface IUpdateLanguagesTextDto {
    id: number;
    key: string;
    value: string;
}