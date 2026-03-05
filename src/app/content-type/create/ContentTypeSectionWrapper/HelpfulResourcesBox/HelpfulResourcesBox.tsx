import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ReactNode } from 'react';

type HelpfulResourcesBoxProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
    video?: ReactNode;
};

const HelpfulResourcesBox = ({ title, subtitle, children, video }: HelpfulResourcesBoxProps) => (
    <div className="tw:bg-light tw:p-4 tw:rounded-xl">
        <h2 className="tw:!text-xl">
            <FontAwesomeIcon icon={faLightbulb} className="tw:text-secondary" /> {title}
        </h2>
        <hr />

        <div className="mt-1">{subtitle}</div>

        {children}

        {video && (
            <>
                <hr />
                <div className="tw:mt-3">
                    <div className="tw:flex tw:items-center tw:gap-1">
                        {video}
                        Video explainer
                    </div>
                </div>
            </>
        )}
    </div>
);

export default HelpfulResourcesBox;
