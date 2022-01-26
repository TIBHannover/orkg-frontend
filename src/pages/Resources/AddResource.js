import { useState, useEffect, useRef } from 'react';
import { Container, Button, FormGroup, Input, Label } from 'reactstrap';
import { useHistory, useLocation } from 'react-router-dom';
import { createLiteralStatement } from 'services/backend/statements';
import { getClassById } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import REGEX from 'constants/regex';
import Cite from 'citation-js';
import ROUTES from 'constants/routes';
import { useSelector } from 'react-redux';
import { PREDICATES, ENTITIES, CLASSES } from 'constants/graphSettings';
import { getArrayParamFromQueryString } from 'utils';
import TitleBar from 'components/TitleBar/TitleBar';

const AddResource = () => {
    const isDOI = new RegExp(REGEX.DOI);
    const classesAutocompleteRef = useRef(null);
    const [label, setLabel] = useState('');
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const [isLoadingDefaultClasses, setIsLoadingDefaultClasses] = useState(false);
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        // Set document title
        document.title = 'Add resource - ORKG';
        const getDefaultClass = async () => {
            let classes = getArrayParamFromQueryString(location.search, 'classes');
            if (!isCurationAllowed) {
                classes = classes.filter(c => c !== CLASSES.RESEARCH_FIELD); // only admins can add research field resources
            }
            if (classes && classes.length > 0) {
                setIsLoadingDefaultClasses(true);
                const fetchDefaultClasses = classes.map(c => getClassById(c));
                Promise.all(fetchDefaultClasses)
                    .then(classesData => {
                        setIsLoadingDefaultClasses(false);
                        setClasses(classesData);
                    })
                    .catch(() => {
                        setIsLoadingDefaultClasses(false);
                    });
            }
        };
        getDefaultClass();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdd = async () => {
        setIsLoading(true);
        if (label.trim() !== '') {
            if (!isDOI.test(label)) {
                try {
                    const newResource = await createResource(label.trim(), classes ? classes.map(c => c.id) : []);
                    toast.success('Resource created successfully');
                    setIsLoading(false);
                    history.push(reverse(ROUTES.RESOURCE, { id: newResource.id }));
                } catch (error) {
                    console.error(error);
                    setIsLoading(false);
                    toast.error(`Error creating resource ${error.message}`);
                }
            } else {
                const doi = label.trim();
                try {
                    try {
                        const responseJson = await Cite.async(doi);
                        setLabel(responseJson.data[0].title);
                        const newResource = await createResource(responseJson.message.title[0], classes ? classes.map(c => c.id) : []);
                        const responseJsonDoi = await createLiteral(doi);
                        await createLiteralStatement(newResource.id, PREDICATES.HAS_DOI, responseJsonDoi.id);
                        toast.success('Resource created successfully');
                        setIsLoading(false);
                        history.push(reverse(ROUTES.RESOURCE, { id: newResource.id }));
                    } catch (error) {
                        console.error(error);
                        toast.error(`Error finding DOI : ${error.message}`);
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error(error);
                    setIsLoading(false);
                    toast.error(`Error creating resource : ${error.message}`);
                }
            }
        } else {
            toast.error('Please enter a resource label');
            setIsLoading(false);
        }
    };

    const handleClassSelect = async (selected, { action }) => {
        if (action === 'create-option') {
            const foundIndex = selected.findIndex(x => x.__isNew__);
            const newClass = await ConfirmClass({
                label: selected[foundIndex].label
            });
            if (newClass) {
                const foundIndex = selected.findIndex(x => x.__isNew__);
                selected[foundIndex] = newClass;
                setClasses(selected);
            } else {
                return null;
            }
        } else {
            setClasses(selected);
        }
    };

    return (
        <>
            <TitleBar>Create resource</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <div className="pt-2">
                    <FormGroup>
                        <Label for="ResourceLabel">Resource label or DOI</Label>
                        <Input
                            onChange={e => setLabel(e.target.value)}
                            type="text"
                            name="value"
                            id="ResourceLabel"
                            disabled={isLoading}
                            placeholder="Resource label or DOI"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="select-classes">Classes</Label>
                        {!isLoadingDefaultClasses && (
                            <AutoComplete
                                entityType={ENTITIES.CLASS}
                                onChange={(selected, action) => {
                                    // blur the field allows to focus and open the menu again
                                    classesAutocompleteRef.current && classesAutocompleteRef.current.blur();
                                    handleClassSelect(selected, action);
                                }}
                                placeholder="Select or type to enter a class"
                                value={classes}
                                autoLoadOption={true}
                                openMenuOnFocus={true}
                                allowCreate={true}
                                isClearable
                                innerRef={classesAutocompleteRef}
                                isMulti
                                autoFocus={false}
                                ols={true}
                                inputId="select-classes"
                            />
                        )}
                        {isLoadingDefaultClasses && <div>Loading default classes</div>}
                    </FormGroup>
                    <Button color="primary" onClick={handleAdd} className="mt-3 mb-2" disabled={isLoading}>
                        {!isLoading ? 'Create Resource' : <span>Loading</span>}
                    </Button>
                </div>
            </Container>
        </>
    );
};

export default AddResource;
