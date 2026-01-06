import { HelpDeskTemplatePage } from './app.po';

describe('HelpDesk App', function () {
    let page: HelpDeskTemplatePage;

    beforeEach(() => {
        page = new HelpDeskTemplatePage();
    });

    it('should display message saying app works', () => {
        page.navigateTo();
        expect(page.getParagraphText()).toEqual('app works!');
    });
});
