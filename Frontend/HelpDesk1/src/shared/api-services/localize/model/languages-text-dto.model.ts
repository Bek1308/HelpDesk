import { ILanguagesTextDto, ICreateLanguagesTextDto, IUpdateLanguagesTextDto } from '../interface/languages-text-dto.interface';

export class LanguagesTextDto implements ILanguagesTextDto {
    id: number;
    languageName: string;
    source: string; // doim HelpDesk
    key: string;
    value: string;

    constructor(data?: ILanguagesTextDto) {
        this.id = data?.id ?? 0;
        this.languageName = data?.languageName ?? '';
        this.key = data?.key ?? '';
        this.value = data?.value ?? '';
        this.source = 'HelpDesk';
    }
    soure: string;

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"] ?? 0;
            this.languageName = _data["languageName"] ?? '';
            this.key = _data["key"] ?? '';
            this.value = _data["value"] ?? '';
        }
        this.source = 'HelpDesk';
    }

    static fromJS(data: any): LanguagesTextDto {
        data = typeof data === 'object' ? data : {};
        let result = new LanguagesTextDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["languageName"] = this.languageName;
        data["key"] = this.key;
        data["value"] = this.value;
        data["source"] = 'HelpDesk';
        return data;
    }

    clone(): LanguagesTextDto {
        const json = this.toJSON();
        let result = new LanguagesTextDto();
        result.init(json);
        return result;
    }
}

export class CreateLanguagesTextDto implements ICreateLanguagesTextDto {
    languageName: string;
    key: string;
    value: string;
    source: string; // doim HelpDesk

    constructor(data?: any) {
        this.languageName = data?.languageName ?? '';
        this.key = data?.key ?? '';
        this.value = data?.value ?? '';
        this.source = 'HelpDesk';
    }

    init(data?: any): void {
        if (data) {
            this.languageName = data.languageName ?? '';
            this.key = data.key ?? '';
            this.value = data.value ?? '';
        }
        this.source = 'HelpDesk';
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["languageName"] = this.languageName;
        data["key"] = this.key;
        data["value"] = this.value;
        data["source"] = 'HelpDesk';
        return data;
    }
}

export class UpdateLanguagesTextDto implements IUpdateLanguagesTextDto {
    id: number;
    key: string;
    value: string;

    constructor(data?: IUpdateLanguagesTextDto) {
        this.id = data?.id ?? 0;
        this.key = data?.key ?? '';
        this.value = data?.value ?? '';
    }

    init(data?: any): void {
        if (data) {
            this.id = data["id"] ?? 0;
            this.key = data["key"] ?? '';
            this.value = data["value"] ?? '';
        }
    }

    static fromJS(data: any): UpdateLanguagesTextDto {
        data = typeof data === 'object' ? data : {};
        let result = new UpdateLanguagesTextDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any): any {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["key"] = this.key;
        data["value"] = this.value;
        return data;
    }

    clone(): UpdateLanguagesTextDto {
        const json = this.toJSON();
        let result = new UpdateLanguagesTextDto();
        result.init(json);
        return result;
    }
}
