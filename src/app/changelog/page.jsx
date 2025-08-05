'use client';

import { marked } from 'marked';
import { Component } from 'react';

import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';

import changelogPath from '../../../CHANGELOG.md';

class Changelog extends Component {
    state = {
        changelogText: null,
    };

    componentDidMount() {
        document.title = 'Changelog - ORKG';

        // NEXT-CODE
        this.setState({
            changelogText: marked(changelogPath),
        });

        // CRA-CODE
        // fetch(changelogPath)
        //     .then(response => response.text())
        //     .then(text => {
        //         this.setState({
        //             changelogText: marked(text),
        //         });
        //     });
    }

    render() {
        return (
            <div>
                <TitleBar>Changelog</TitleBar>
                <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: this.state.changelogText,
                        }}
                    />
                </Container>
            </div>
        );
    }
}

export default Changelog;
