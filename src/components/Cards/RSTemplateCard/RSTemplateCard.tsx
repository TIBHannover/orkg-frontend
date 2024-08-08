import { faCalendar, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'components/NextJsMigration/Link';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import ROUTES from 'constants/routes';
import { toInteger } from 'lodash';
import moment from 'moment';
import { reverse } from 'named-urls';
import { FC } from 'react';
import ReactStringReplace from 'react-string-replace';
import { RosettaStoneTemplate } from 'services/backend/types';

type RSTemplateCardProps = {
    template: RosettaStoneTemplate;
};

const RSTemplateCard: FC<RSTemplateCardProps> = ({ template }) => {
    const replacementFunction = (match: string) => {
        const i = toInteger(match);
        return <i>{template.properties[i].placeholder}</i>;
    };

    const formattedLabelWithPlaceholders = ReactStringReplace(
        template.formatted_label?.replaceAll(']', ' ').replaceAll('[', ' ') ?? '',
        /{(.*?)}/,
        replacementFunction,
    );

    return (
        <div className="list-group-item d-flex py-3 pe-4 ps-4">
            <div className="col-md-9 d-flex p-0">
                <div className="d-flex flex-column flex-grow-1">
                    <div className="mb-2">
                        {/* @ts-expect-error */}
                        <Link href={reverse(ROUTES.RS_TEMPLATE, { id: template.id })}>{template.label ? template.label : <em>No title</em>}</Link>
                    </div>
                    <div className="small text-muted">{formattedLabelWithPlaceholders}</div>
                    {template.description && (
                        <div>
                            <small className="text-muted">{template.description}</small>
                        </div>
                    )}
                    <div className="mb-1">
                        <small>
                            <Icon size="sm" icon={faShapes} className="me-1" /> {template.properties?.length} Positions
                            <Icon size="sm" icon={faCalendar} className="ms-2 me-1" /> {moment(template.created_at).format('DD-MM-YYYY')}
                        </small>
                    </div>
                </div>
            </div>
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                    <UserAvatar userId={template.created_by} />
                </div>
            </div>
        </div>
    );
};

export default RSTemplateCard;
