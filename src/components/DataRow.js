import React, {Component} from 'react';
import DataList from './DataList';
import {Button, Container, Form, Modal, Icon, Segment, Grid, TextArea, Input, Label} from 'semantic-ui-react';

class DataRow extends Component {
    render() {
        /* Name of the ID property. */
        const idPropertyName = 'id';

        /* Name of the property that should be displayed as text. */
        const displayPropertyName = 'value';

        /* Hidden properties. */
        const ignoredProperties = [idPropertyName, displayPropertyName];

        const data = this.props.data;

        if (!data) {
            return null;
        }

        if (data instanceof Object) {
            /* Objects should be rendered with their content. */
            const rows = [];

            const propertiesContent =  Object.entries(data).filter(
                (entry) => !(entry[0] in ignoredProperties) && entry[1] instanceof Array
            );

            if (propertiesContent.length > 0) {
                propertiesContent.forEach(
                    (value, index) => {
                        console.log(value + ', ' + index);
                        rows.push(
                            <span>
                                {index === 0 ? <br/> : null}
                                {value[0]}<br/>
                                <DataList key={index} data={value[1]}/><br/>
                            </span>
                        );
                    }
                );
            }

            return (
                <li>
                    <a href="#">{data[displayPropertyName]}</a> {rows.length != 0 ? <Button>+</Button> : null}
                    <br/>
                    {rows}
                </li>
            );
        } else {
            /* Non objects should be rendered as is. */
            return (
                <li>
                    {data}
                </li>
            );
        }
    }
}

export default DataRow;