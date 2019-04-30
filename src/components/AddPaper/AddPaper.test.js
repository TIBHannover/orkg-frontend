import React from 'react';
import { mount } from 'enzyme';
import AddPaper from './AddPaper';
import { Provider } from 'react-redux'
import configureStore, { history } from '../../store'

//beforeEach?
const mountComponent = () => {
    const store = configureStore();

    // needed for the tooltips
    const div = document.createElement('div');
    document.body.appendChild(div);

    return mount(<Provider store={store}><AddPaper /></Provider>, { attachTo: div });
}

it('renders without crashing', () => {
    mountComponent();
});

it('lookup doi', () => {
    const wrap = mountComponent();

    wrap.find('input[name="doi"]').simulate('click');
    wrap.find('[data-test="nextStep"]').hostNodes().simulate('click');        
});