import { reverse } from 'named-urls';
import Link from 'next/link';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import ROUTES from '@/constants/routes';
import { RSPropertyShape } from '@/services/backend/types';

export const HeaderStyled = styled.div`
    border-bottom: 1px ${(props) => props.theme.secondaryDarker} solid;
`;

export const LinkStyled = styled(Link)`
    .typeCircle {
        width: 18px;
        height: 18px;
        line-height: 15px;
        text-align: center;
        color: white;
        display: inline-block;
        border: 1px ${(props) => props.theme.secondaryDarker} solid;
        margin-right: 3px;
        border-radius: 100%;
        font-size: 9px;
        font-weight: bold;
        background: ${(props) => props.theme.secondary};
    }

    &:hover .typeCircle {
        background: ${(props) => props.theme.primary};
    }
`;

type SlotTooltipProps = {
    children: React.ReactNode;
    slot: RSPropertyShape;
};

export const SlotTooltip = ({ children, slot }: SlotTooltipProps) => {
    return (
        <Tooltip
            content={
                <>
                    <HeaderStyled className="pb-2 mb-2 d-flex">
                        <div className="flex-grow-1">{slot.placeholder}</div>
                    </HeaderStyled>

                    {slot.description && (
                        <div>
                            <b>Description:</b>
                            <p className="small mb-0">{slot.description}</p>
                        </div>
                    )}
                    {'class' in slot && slot.class?.id && (
                        <div>
                            <b>Range:</b>
                            <p className="small mb-0">
                                <LinkStyled target="_blank" href={reverse(ROUTES.CLASS, { id: slot.class?.id })}>
                                    <i>
                                        <span className="typeCircle">C</span> {slot.class?.label}
                                    </i>
                                </LinkStyled>
                            </p>
                        </div>
                    )}
                    {'datatype' in slot && slot.datatype?.id && (
                        <>
                            <div>
                                <b>Range:</b>
                                <div>
                                    <p className="small mb-0">{slot.datatype.label}</p>
                                </div>
                            </div>
                            {'pattern' in slot && slot.pattern && (
                                <div>
                                    <b>Pattern:</b>
                                    <p className="small mb-0">{slot.pattern}</p>
                                </div>
                            )}
                            {'min_inclusive' in slot && slot.min_inclusive && (
                                <div>
                                    <b>Min inclusive:</b>
                                    <p className="small mb-0">{slot.min_inclusive}</p>
                                </div>
                            )}
                            {'max_inclusive' in slot && slot.max_inclusive && (
                                <div>
                                    <b>Max inclusive:</b>
                                    <p className="small mb-0">{slot.max_inclusive}</p>
                                </div>
                            )}
                        </>
                    )}
                    {slot.min_count !== undefined && slot.min_count !== null && (
                        <div>
                            <b>Min count:</b>
                            <p className="small mb-0">{slot.min_count}</p>
                        </div>
                    )}
                    {slot.max_count !== undefined && slot.max_count !== null && (
                        <div>
                            <b>Max count:</b>
                            <p className="small mb-0">{slot.max_count}</p>
                        </div>
                    )}
                </>
            }
        >
            <span tabIndex={0} role="button" style={{ cursor: 'inherit' }}>
                {children}
            </span>
        </Tooltip>
    );
};
