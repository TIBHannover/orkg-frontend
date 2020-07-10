import { Cookies } from 'react-cookie';
import queryString from 'query-string';
import { orderBy } from 'lodash';
import { sortMethod } from 'utils';
export const url = `${process.env.REACT_APP_SERVER_URL}api/`;
export const similaireServiceUrl = process.env.REACT_APP_SIMILARITY_SERVICE_URL;
export const annotationServiceUrl = process.env.REACT_APP_ANNOTATION_SERVICE_URL;
export const resourcesUrl = `${url}resources/`;
export const organizationsUrl = `${url}organizations/`;
export const observatoriesUrl = `${url}observatories/`;
export const problemsUrl = `${url}problems/`;
export const predicatesUrl = `${url}predicates/`;
export const userUrl = `${url}user/`;
export const statementsUrl = `${url}statements/`;
export const literalsUrl = `${url}literals/`;
export const classesUrl = `${url}classes/`;
export const statsUrl = `${url}stats/`;
export const crossrefUrl = process.env.REACT_APP_CROSSREF_URL;
export const arxivUrl = process.env.REACT_APP_ARXIV_URL;
export const semanticScholarUrl = process.env.REACT_APP_SEMANTICSCHOLAR_URL;
export const comparisonUrl = `${similaireServiceUrl}compare/`;
export const similaireUrl = `${similaireServiceUrl}similar/`;
export const authenticationUrl = process.env.REACT_APP_SERVER_URL;

/**
 * Sends simple GET request to the URL.
 */
export const submitGetRequest = (url, headers, send_token = false) => {
    if (!url) {
        throw new Error('Cannot submit GET request. URL is null or undefined.');
    }

    const myHeaders = headers ? new Headers(headers) : {};

    if (send_token) {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        if (token) {
            myHeaders.append('Authorization', `Bearer ${token}`);
        }
    }

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: myHeaders
        })
            .then(response => {
                if (!response.ok) {
                    reject({
                        error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                        statusCode: response.status,
                        statusText: response.statusText
                    });
                } else {
                    const json = response.json();
                    if (json.then) {
                        json.then(resolve).catch(reject);
                    } else {
                        return resolve(json);
                    }
                }
            })
            .catch(reject);
    });
};

const submitPostRequest = (url, headers, data, jsonStringify = true, send_token = true) => {
    if (!url) {
        throw new Error('Cannot submit POST request. URL is null or undefined.');
    }

    const myHeaders = new Headers(headers);

    if (send_token) {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        if (token) {
            myHeaders.append('Authorization', `Bearer ${token}`);
        }
    }

    if (jsonStringify) {
        data = JSON.stringify(data);
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'POST', headers: myHeaders, body: data })
            .then(response => {
                if (!response.ok) {
                    const json = response.json();
                    if (json.then) {
                        json.then(reject);
                    } else {
                        reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                    }
                } else {
                    const json = response.json();
                    if (json.then) {
                        json.then(resolve).catch(reject);
                    } else {
                        return resolve(json);
                    }
                }
            })
            .catch(reject);
    });
};

const submitPutRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit PUT request. URL is null or undefined.');
    }

    const cookies = new Cookies();
    const token = cookies.get('token') ? cookies.get('token') : null;
    const myHeaders = new Headers(headers);
    if (token) {
        myHeaders.append('Authorization', `Bearer ${token}`);
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'PUT', headers: myHeaders, body: JSON.stringify(data) })
            .then(response => {
                if (!response.ok) {
                    const json = response.json();
                    if (json.then) {
                        json.then(reject);
                    } else {
                        reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                    }
                } else {
                    const json = response.json();
                    if (json.then) {
                        json.then(resolve).catch(reject);
                    } else {
                        return resolve(json);
                    }
                }
            })
            .catch(reject);
    });
};

const submitDeleteRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit DELETE request. URL is null or undefined.');
    }

    return new Promise((resolve, reject) => {
        fetch(url, { method: 'DELETE', headers: headers, body: JSON.stringify(data) })
            .then(response => {
                if (!response.ok) {
                    reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                } else {
                    return resolve();
                }
            })
            .catch(reject);
    });
};

export const updateResource = (id, label) => {
    return submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const updateResourceClasses = (id, classes = null) => {
    return submitPutRequest(`${resourcesUrl}${id}`, { 'Content-Type': 'application/json' }, { ...(classes ? { classes: classes } : null) });
};

export const updateLiteral = (id, label) => {
    return submitPutRequest(`${literalsUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const updatePredicate = (id, label) => {
    return submitPutRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label });
};

export const createResource = (label, classes = []) => {
    return submitPostRequest(resourcesUrl, { 'Content-Type': 'application/json' }, { label, classes });
};

export const createLiteral = (label, datatype = process.env.REACT_APP_DEFAULT_LITERAL_DATATYPE) => {
    return submitPostRequest(literalsUrl, { 'Content-Type': 'application/json' }, { label: label, datatype: datatype });
};

export const createClass = label => {
    return submitPostRequest(classesUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const createResourceStatement = (subjectId, predicateId, objectId) => {
    return submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: objectId
        }
    );
};

export const createLiteralStatement = (subjectId, predicateId, literalId) => {
    return submitPostRequest(
        `${statementsUrl}`,
        { 'Content-Type': 'application/json' },
        {
            subject_id: subjectId,
            predicate_id: predicateId,
            object_id: literalId
        }
    );
};

export const updateStatement = (id, { subject_id = null, predicate_id = null, object_id = null }) => {
    return submitPutRequest(
        `${statementsUrl}${id}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id: subject_id } : null),
            ...(predicate_id ? { predicate_id: predicate_id } : null),
            ...(object_id ? { object_id: object_id } : null)
        }
    );
};

export const updateStatements = (statementIds, { subject_id = null, predicate_id = null, object_id = null }) => {
    return submitPutRequest(
        `${statementsUrl}?ids=${statementIds.join()}`,
        { 'Content-Type': 'application/json' },
        {
            ...(subject_id ? { subject_id: subject_id } : null),
            ...(predicate_id ? { predicate_id: predicate_id } : null),
            ...(object_id ? { object_id: object_id } : null)
        }
    );
};

export const createPredicate = label => {
    return submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json' }, { label: label });
};

export const getPredicate = id => {
    return submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);
};

export const getResource = id => {
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/`);
};

export const getAllResources = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null, exclude = null }) => {
    const params = queryString.stringify({
        page: page,
        items: items,
        sortBy: sortBy,
        desc: desc,
        ...(q ? { q: q } : {}),
        ...(exclude ? { exclude: exclude } : {})
    });

    return submitGetRequest(`${resourcesUrl}?${params}`);
};

export const getAllPredicates = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc, ...(q ? { q: q } : {}) });

    return submitGetRequest(`${predicatesUrl}?${params}`);
};

export const getAllStatements = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}?${params}`);
};

export const getPredicatesByLabel = label => {
    return submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(label));
};

export const deleteStatementById = id => {
    return submitDeleteRequest(statementsUrl + encodeURIComponent(id));
};

export const deleteStatementsByIds = ids => {
    return submitDeleteRequest(`${statementsUrl}?ids=${ids.join()}`);
};

export const getStatementsBySubject = ({ id, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}subject/${encodeURIComponent(id)}/?${params}`);
};

export const getStatementsBySubjects = ({ ids, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    const params = queryString.stringify({ ids: ids.join(), page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}subjects/?${params}`);
};

export const getStatementsByObject = async ({ id, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    const statements = await submitGetRequest(`${statementsUrl}object/${encodeURIComponent(id)}/?${params}`);

    return statements;
};

export const getResourcesByClass = async ({ id, page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null, creator = null }) => {
    const params = queryString.stringify({ page, items, sortBy, desc, creator, ...(q ? { q } : {}) });

    const resources = await submitGetRequest(`${classesUrl}${encodeURIComponent(id)}/resources/?${params}`);

    return resources;
};

export const getStatementsByPredicate = ({ id, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}predicate/${encodeURIComponent(id)}/?${params}`);
};

export const getStatementsBySubjectAndPredicate = ({ subjectId, predicateId, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}subject/${subjectId}/predicate/${predicateId}/?${params}`);
};

export const getStatementsByObjectAndPredicate = ({ objectId, predicateId, page = 1, items = 9999, sortBy = 'created_at', desc = true }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc });

    return submitGetRequest(`${statementsUrl}object/${objectId}/predicate/${predicateId}/?${params}`);
};

export const getComparison = ({ contributionIds = [], save_response = false }) => {
    return submitGetRequest(`${comparisonUrl}?contributions=${contributionIds.join()}&save_response=${save_response}`);
};

export const getSimilaireContribution = id => {
    return submitGetRequest(`${similaireUrl}${encodeURIComponent(id)}/`);
};

export const getAnnotations = abstract => {
    return submitPostRequest(`${annotationServiceUrl}annotator/`, { 'Content-Type': 'application/json' }, { text2annotate: abstract });
};

export const indexContribution = contribution_id => {
    return fetch(`${similaireServiceUrl}internal/index/${encodeURIComponent(contribution_id)}/`, {
        method: 'GET'
    });
};

export const getStats = () => {
    return submitGetRequest(statsUrl);
};

export const getResearchFieldsStats = () => {
    return submitGetRequest(`${statsUrl}fields`);
};

export const createShortLink = data => {
    return submitPostRequest(`${similaireServiceUrl}shortener/`, { 'Content-Type': 'application/json' }, data);
};

export const getLongLink = shortCode => {
    return submitGetRequest(`${similaireServiceUrl}shortener/${encodeURIComponent(shortCode)}/`);
};

export const getRDFDataCubeVocabularyClasses = () => {
    return submitGetRequest(`${classesUrl}?q=qb:`);
};

export const getAllClasses = ({ page = 1, items = 9999, sortBy = 'created_at', desc = true, q = null }) => {
    const params = queryString.stringify({ page: page, items: items, sortBy: sortBy, desc: desc, ...(q ? { q: q } : {}) });

    return submitGetRequest(`${classesUrl}?${params}`);
};

export const saveFullPaper = data => {
    return submitPostRequest(`${url}papers/`, { 'Content-Type': 'application/json' }, data);
};

export const getPaperByDOI = doi => {
    return submitGetRequest(`${url}widgets/?doi=${doi}`);
};

export const signInWithEmailAndPassword = async (email, password) => {
    // because of the spring oauth implementation, these calls don't send json
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic b3JrZy1jbGllbnQ6c2VjcmV0'
    };

    const data = {
        username: email,
        grant_type: 'password',
        client_id: `${process.env.REACT_APP_AUTHENTICATION_CLIENT_ID}`,
        password
    };

    const formBody = Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');

    return submitPostRequest(`${authenticationUrl}oauth/token`, headers, formBody, false, false);

    /*//TODO: use this setup also in submitPostRequest, and remove the code from there
  //difference here is that a json is parsed, no matter whether response.ok is true or not
  try {
    const response = await fetch(`${authenticationUrl}oauth/token`,
      {
        headers: headers,
        method: 'POST',
        body: formBody,
      }
    );
    const json = await response.json();

    if (!response.ok) {
      throw json;
    }

    return json;
    
  } catch (error) {
    throw error;
  }*/
};

export const registerWithEmailAndPassword = (email, password, matching_password, name) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    const data = {
        display_name: name,
        email: email,
        password: password,
        matching_password: matching_password
    };

    return submitPostRequest(`${url}auth/register`, headers, data, true, false);
};

export const getUserInformation = () => {
    return submitGetRequest(`${url}user/`, {}, true);
};

export const getUserInformationById = userId => {
    return submitGetRequest(`${url}user/` + userId, {}, true);
};

export const updateUserInformation = ({ email, display_name }) => {
    const headers = { 'Content-Type': 'application/json' };

    const data = {
        //email, //back doesn't support this
        display_name: display_name
    };

    return submitPutRequest(`${url}user/`, headers, data);
};

export const updateUserPassword = ({ current_password, new_password, new_matching_password }) => {
    const headers = { 'Content-Type': 'application/json' };

    const data = {
        current_password: current_password,
        new_password: new_password,
        new_matching_password: new_matching_password
    };

    return submitPutRequest(`${url}user/password/`, headers, data);
};

export const updateUserRole = () => {
    return submitPutRequest(`${userUrl}role/`);
};

export const getClassOfTemplate = templateId => {
    return submitGetRequest(`${classesUrl}?q=${templateId}&exact=true`);
};

/**
 * Load template by ID
 *
 * @param {String} templateId Template Id
 */
export const getTemplateById = templateId => {
    return getResource(templateId).then(template =>
        getStatementsBySubject({ id: templateId }).then(templateStatements => {
            const templatePredicate = templateStatements.find(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_PREDICATE);

            const templateClass = templateStatements.find(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_CLASS);

            const templateFormatLabel = templateStatements.find(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_LABEL_FORMAT);

            const templateIsStrict = templateStatements.find(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_STRICT);

            const templateComponents = templateStatements.filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT);

            const components = getStatementsBySubjects({ ids: templateComponents.map(component => component.object.id) }).then(
                componentsStatements => {
                    return componentsStatements.map(componentStatements => {
                        const property = componentStatements.statements.find(
                            statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_PROPERTY
                        );
                        const value = componentStatements.statements.find(
                            statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_VALUE
                        );

                        const validationRules = componentStatements.statements.filter(
                            statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_VALIDATION_RULE
                        );

                        const minOccurs = componentStatements.statements.find(
                            statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_OCCURRENCE_MIN
                        );

                        const maxOccurs = componentStatements.statements.find(
                            statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_OCCURRENCE_MAX
                        );

                        const order = componentStatements.statements.find(
                            statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_COMPONENT_ORDER
                        );

                        return {
                            id: componentStatements.id,
                            property: property
                                ? {
                                      id: property.object.id,
                                      label: property.object.label
                                  }
                                : {},
                            value: value
                                ? {
                                      id: value.object.id,
                                      label: value.object.label
                                  }
                                : {},
                            minOccurs: minOccurs ? minOccurs.object.label : 0,
                            maxOccurs: maxOccurs ? maxOccurs.object.label : null,
                            order: order ? order.object.label : null,
                            validationRules:
                                validationRules && Object.keys(validationRules).length > 0
                                    ? validationRules.reduce((obj, item) => {
                                          const rule = item.object.label.split(/#(.+)/)[0];
                                          const value = item.object.label.split(/#(.+)/)[1];
                                          return Object.assign(obj, { [rule]: value });
                                      }, {})
                                    : {}
                        };
                    });
                }
            );

            return Promise.all([components]).then(templateComponents => ({
                id: templateId,
                label: template.label,
                statements: templateStatements.map(s => s.id),
                predicate: templatePredicate
                    ? {
                          id: templatePredicate.object.id,
                          label: templatePredicate.object.label
                      }
                    : {},
                labelFormat: templateFormatLabel ? templateFormatLabel.object.label : '',
                hasLabelFormat: templateFormatLabel ? true : false,
                isStrict: templateIsStrict ? true : false,
                components: templateComponents[0].sort((c1, c2) => sortMethod(c1.order, c2.order)),
                class: templateClass
                    ? {
                          id: templateClass.object.id,
                          label: templateClass.object.label
                      }
                    : {},
                researchFields: templateStatements
                    .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_RESEARCH_FIELD)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    })),
                researchProblems: templateStatements
                    .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    }))
            }));
        })
    );
};

/**
 * Get Parents of research field
 *
 * @param {String} researchFieldId research field Id
 */
export const getParentResearchFields = (researchFieldId, parents = []) => {
    if (researchFieldId === process.env.REACT_APP_RESEARCH_FIELD_MAIN) {
        parents.push({ id: researchFieldId, label: 'Research Field' });
        return Promise.resolve(parents);
    } else {
        return getStatementsByObjectAndPredicate({
            objectId: researchFieldId,
            predicateId: process.env.REACT_APP_PREDICATES_HAS_SUB_RESEARCH_FIELD
        }).then(parentResearchField => {
            parents.push(parentResearchField[0].object);
            return getParentResearchFields(parentResearchField[0].subject.id, parents);
        });
    }
};

/**
 * Get Template by Class
 *
 * @param {String} classID class ID
 */
export const getTemplatesByClass = classID => {
    return getStatementsByObjectAndPredicate({
        objectId: classID,
        predicateId: process.env.REACT_APP_TEMPLATE_OF_CLASS
    }).then(statements =>
        Promise.all(
            statements
                .filter(statement => statement.subject.classes?.includes(process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE))
                .map(st => st.subject.id)
        )
    );
};

export const getAllOrganizations = () => {
    return submitGetRequest(`${organizationsUrl}`);
};

export const getOrganization = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/`);
};

export const createOrganization = (organizationName, organizationLogo, createdBy, url) => {
    return submitPostRequest(organizationsUrl, { 'Content-Type': 'application/json' }, { organizationName, organizationLogo, createdBy, url });
};

export const getAllObservatoriesByOrganizationId = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/observatories`);
};

export const getObservatoryById = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/`);
};

export const getUsersByObservatoryId = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/users`);
};

export const getUsersByOrganizationId = id => {
    return submitGetRequest(`${organizationsUrl}${encodeURIComponent(id)}/users`);
};

export const getResourcesByObservatoryId = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/papers`);
};

export const getComparisonsByObservatoryId = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/comparisons`);
};

export const getProblemsByObservatoryId = id => {
    return submitGetRequest(`${observatoriesUrl}${encodeURIComponent(id)}/problems`);
};

export const createObservatory = (observatoryName, organizationId, description) => {
    return submitPostRequest(observatoriesUrl, { 'Content-Type': 'application/json' }, { observatoryName, organizationId, description });
};

export const getContributorsByResourceId = id => {
    return submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/contributors`).then(contributors => {
        const c = contributors.map(contributor => {
            if (contributor.createdBy === '00000000-0000-0000-0000-000000000000') {
                return { ...contributor, created_by: { id: '00000000-0000-0000-0000-000000000000', display_name: 'Unknown' } };
            } else {
                return getUserInformationById(contributor.createdBy).then(user => ({ ...contributor, created_by: user }));
            }
        });
        // Order the contribution timeline because it's not ordered in the result
        return Promise.all(c).then(rc => orderBy(rc, ['created_at'], ['desc']));
    });
};

export const getObservatoryAndOrganizationInformation = (observatoryId, organizationId) => {
    return getObservatoryById(observatoryId).then(obsResponse => {
        return getOrganization(organizationId).then(orgResponse => {
            return {
                id: observatoryId,
                name: obsResponse.name.toUpperCase(),
                organization: {
                    id: organizationId,
                    name: orgResponse.name,
                    logo: orgResponse.logo
                }
            };
        });
    });
};

export const getResearchFieldsByResearchProblemId = problemId => {
    return submitGetRequest(`${problemsUrl}${encodeURIComponent(problemId)}/fields`);
};
