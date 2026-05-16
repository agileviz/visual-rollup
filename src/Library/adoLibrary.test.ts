import { getRootQueries, getQueryItem } from "./adoLibrary";

// todo: this should be removed, to test adoLibrary we need to mock ADO APIs, not adoLibrary
jest.mock('./adoLibrary');


describe('getRootQueries', () => {

    it('is defined', () => {
        expect(getRootQueries()).toBeDefined();
    });

    it('getRootQueries returns an array', () => {
        expect(getRootQueries().then(data => expect(data).toBeInstanceOf(Array)));
    });

    it('getRootQueries returns the expected Queries simplified', () => {
        expect(getRootQueries().then(data => expect(data).toMatchSnapshot()));
    });

});


describe('getQueryItem', () => {

    it('is defined', () => {
        expect(getQueryItem("89626995-3d87-48ca-93f1-6e3c9c5cfbba")).toBeDefined();
    });

    it('getRootQueries returns an array', () => {
        expect(getQueryItem("89626995-3d87-48ca-93f1-6e3c9c5cfbba").then(data => expect(data).toBeInstanceOf(Object)));
    });

    it('getRootQueries returns the expected Queries simplified', () => {
        expect(getQueryItem("89626995-3d87-48ca-93f1-6e3c9c5cfbba").then(data => expect(data).toMatchSnapshot()));
    });

});
