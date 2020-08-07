import React from 'react';
import { mount } from 'enzyme';
import AddPaper from '../../pages/AddPaper';
import { Provider } from 'react-redux';
import { theme } from 'App.test.js';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'store';

//TODO: this test is not finished, needs to be determined how componenets will be tested
// E.g. the backend calls should not be tested, but many of the functionality relies on the backend
// More info: # https://wanago.io/2018/09/17/javascript-testing-tutorial-part-four-mocking-api-calls-and-simulating-react-components-interactions/

const mountComponent = () => {
    //beforeEach
    const store = configureStore();

    // needed for the tooltips
    const div = document.createElement('div');
    document.body.appendChild(div);

    return mount(
        <Router>
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <AddPaper />
                </ThemeProvider>
            </Provider>
        </Router>,
        { attachTo: div }
    );
};

it('renders without crashing', () => {
    mountComponent();
});

it('lookup doi', () => {
    const wrap = mountComponent();

    wrap.find('input[name="entry"]').simulate('click');
    wrap.find('[data-test="nextStep"]')
        .hostNodes()
        .simulate('click');
});
