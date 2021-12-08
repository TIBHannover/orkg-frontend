import { Component } from 'react';
import { Container } from 'reactstrap';
import changelogPath from './CHANGELOG.md';
import marked from 'marked';
import TitleBar from 'components/TitleBar/TitleBar';

class Changelog extends Component {
    state = {
        changelogText: null
    };
    componentDidMount = () => {
        document.title = 'Changelog - ORKG';

        fetch(changelogPath)
            .then(response => {
                return response.text();
            })
            .then(text => {
                this.setState({
                    changelogText: marked(text)
                });
            });
    };

    render() {
        return (
            <div>
                <TitleBar>Changelog</TitleBar>
                <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: this.state.changelogText
                        }}
                    />
                </Container>
            </div>
        );
    }
}

export default Changelog;
