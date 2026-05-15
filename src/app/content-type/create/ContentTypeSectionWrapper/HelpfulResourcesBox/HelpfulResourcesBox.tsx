import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Separator } from '@heroui/react';
import type { ReactNode } from 'react';

type HelpfulResourcesBoxProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
    video?: ReactNode;
};

const HelpfulResourcesBox = ({ title, subtitle, children, video }: HelpfulResourcesBoxProps) => (
    <div className="bg-surface-secondary p-5 rounded-xl flex flex-col gap-3">
        <h2 className="text-xl flex items-center gap-2 m-0">
            <FontAwesomeIcon icon={faLightbulb} className="text-secondary" />
            {title}
        </h2>
        <Separator variant="secondary" />
        <div className="flex flex-col gap-2">
            <div>{subtitle}</div>
            <div>{children}</div>
        </div>
        {video && (
            <>
                <Separator variant="secondary" />
                <div className="flex items-center gap-2">
                    {video}
                    <span>Video explainer</span>
                </div>
            </>
        )}
    </div>
);

export default HelpfulResourcesBox;
