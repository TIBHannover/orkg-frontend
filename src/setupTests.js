import { configure } from 'enzyme';
import 'jest-canvas-mock';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';
import { server } from 'services/mocks/server';

configure({ adapter: new Adapter() });

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
