import React, { useState, useEffect } from 'react';
import { Container, ButtonGroup, Button, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBars, faCheckCircle, faCog, faDownload, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Section from 'components/SmartArticle/Section';
import PropTypes from 'prop-types';
import useLoad from 'components/SmartArticle/hooks/useLoad';
import { useSelector } from 'react-redux';
import Title from 'components/SmartArticle/Title';
import Authors from 'components/SmartArticle/Authors';
import AddSection from 'components/SmartArticle/AddSection';
import Tippy from '@tippy.js/react';

const SmartArticle = props => {
    const id = props.match.params.id || null;
    const { load } = useLoad();
    const sections = useSelector(state => state.smartArticle.sectionResources);
    const isLoading = useSelector(state => state.smartArticle.isLoading);

    useEffect(() => {
        document.title = 'Smart survey - ORKG';

        load(id);
    }, [id, load]);

    return (
        <div>
            <Container>
                <div className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">Smart article writer</h1>
                    <div className="flex-shrink-0 d-flex align-items-center">
                        {isLoading ? (
                            <Icon icon={faSpinner} spin className="mr-2" />
                        ) : (
                            <Tippy content="All changes are saved">
                                <span className="mr-2">
                                    <Icon icon={faCheckCircle} className="text-darkblue" style={{ fontSize: '125%' }} />
                                </span>
                            </Tippy>
                        )}
                        <ButtonGroup>
                            <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                                <Icon icon={faDownload} />
                            </Button>
                            <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                                <Icon icon={faCog} />
                            </Button>
                            <Button className="flex-shrink-0" active color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                                <Icon icon={faTimes} /> Stop editing
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
            </Container>

            <Title />
            <Authors />
            <AddSection />
            {sections.map(section => (
                <Section key={section.id} section={section} />
            ))}
        </div>
    );
};

SmartArticle.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default SmartArticle;
