import { faCheckCircle, faCog, faDownload, faPen, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippy.js/react';
import AddSection from 'components/SmartArticle/AddSection';
import AuthorsSection from 'components/SmartArticle/AuthorsSection';
import useLoad from 'components/SmartArticle/hooks/useLoad';
import Sections from 'components/SmartArticle/Sections';
import Title from 'components/SmartArticle/Title';
import ViewArticle from 'components/SmartArticle/ViewArticle';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, ButtonGroup, Container } from 'reactstrap';
import ContentLoader from 'react-content-loader';
import { times } from 'lodash';

const SmartArticle = props => {
    const id = props.match.params.id || null;
    const { load, isLoading } = useLoad();
    const isLoadingInline = useSelector(state => state.smartArticle.isLoading);
    const [isEditing, setIsEditing] = useState(false);

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
                        {isEditing && (
                            <>
                                {isLoadingInline ? (
                                    <Icon icon={faSpinner} spin className="mr-2" />
                                ) : (
                                    <Tippy content="All changes are saved">
                                        <span className="mr-2">
                                            <Icon icon={faCheckCircle} className="text-darkblue" style={{ fontSize: '125%' }} />
                                        </span>
                                    </Tippy>
                                )}
                            </>
                        )}
                        <ButtonGroup>
                            <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                                <Icon icon={faDownload} />
                            </Button>
                            {isEditing && (
                                <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                                    <Icon icon={faCog} />
                                </Button>
                            )}

                            {!isEditing ? (
                                <Button
                                    className="flex-shrink-0"
                                    color="darkblue"
                                    size="sm"
                                    style={{ marginLeft: 1 }}
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            ) : (
                                <Button
                                    className="flex-shrink-0"
                                    active
                                    color="darkblue"
                                    size="sm"
                                    style={{ marginLeft: 1 }}
                                    onClick={() => setIsEditing(false)}
                                >
                                    <Icon icon={faTimes} /> Stop editing
                                </Button>
                            )}
                        </ButtonGroup>
                    </div>
                </div>
            </Container>
            {!isLoading && isEditing && (
                <>
                    <Container>
                        <Title />
                        <AuthorsSection />
                    </Container>
                    <AddSection index={0} />
                    <Sections />
                </>
            )}
            {!isLoading && !isEditing && <ViewArticle />}
            {isLoading && (
                <Container>
                    <div className="box rounded p-5">
                        <ContentLoader height={60} width={100} speed={2} primaryColor="#f3f3f3" secondaryColor="#ccc">
                            {/* title */}
                            <rect x="0" y="0" rx="0" ry="0" width="100" height="5" />
                            {/* authors */}
                            <rect x="0" y="6" rx="0" ry="0" width="15" height="3" />
                            <rect x="16" y="6" rx="0" ry="0" width="15" height="3" />
                            <rect x="32" y="6" rx="0" ry="0" width="15" height="3" />
                            <rect x="32" y="6" rx="0" ry="0" width="15" height="3" />
                            {/* 3 sections */}
                            {times(3, i => (
                                <>
                                    <rect x="0" y={13 + i * 17} rx="0" ry="0" width="100" height="4" />
                                    <rect x="0" y={18 + i * 17} rx="0" ry="0" width="30" height="1" />
                                    <rect x="0" y={20 + i * 17} rx="0" ry="0" width="45" height="1" />
                                    <rect x="0" y={22 + i * 17} rx="0" ry="0" width="35" height="1" />
                                    <rect x="0" y={24 + i * 17} rx="0" ry="0" width="45" height="1" />
                                </>
                            ))}
                        </ContentLoader>
                    </div>
                </Container>
            )}
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
