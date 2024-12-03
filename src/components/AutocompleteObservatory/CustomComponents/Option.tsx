import Image from 'next/image';
import type { GroupBase } from 'react-select';
import { OptionProps, components } from 'react-select';
import { getOrganizationLogoUrl } from 'services/backend/organizations';
import { Organization } from 'services/backend/types';
import styled from 'styled-components';

const LogoContainer = styled.div`
    overflow: hidden;
    width: 70px;
    height: 32px;
    text-align: center;
    & img {
        width: auto; // to maintain aspect ratio
        height: 100%;
        background: #fff;
    }
`;

const Option = <OptionT extends Organization, Group extends GroupBase<OptionT>, IsMulti extends boolean = false>(
    props: OptionProps<OptionT, IsMulti, Group>,
) => {
    const { data } = props;

    return (
        <components.Option {...props}>
            <div className="d-flex">
                <LogoContainer className="me-2">
                    <Image alt={data.name} src={getOrganizationLogoUrl(data?.id)} width={70} height={32} />
                </LogoContainer>
                {data.name}
            </div>
        </components.Option>
    );
};

export default Option;
