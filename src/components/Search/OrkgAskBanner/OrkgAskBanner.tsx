import Image from 'next/image';
import logo from 'components/Search/OrkgAskBanner/logo.png';

const OrkgAskBanner = () => {
    return (
        <a href="https://ask.orkg.org" target="_blank" rel="noreferrer" className="text-body" style={{ fontSize: '95%' }}>
            <div className="bg-light rounded px-3 py-2 d-flex align-items-center">
                <div>
                    <Image src={logo} width="150" alt="Logo of ORKG Ask" />
                </div>
                <div className="ps-3">
                    <div className="fw-bold">Search in ORKG Ask</div>
                    Find research you are actually looking for
                </div>
            </div>
        </a>
    );
};

export default OrkgAskBanner;
