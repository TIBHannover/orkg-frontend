import { faMastodon } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Separator } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

import EU_LOGO from '@/assets/img/poweredby/co-funded-h2020-horiz_en.png';
import EOSC_LOGO from '@/assets/img/poweredby/EOSC.png';
import INFAI_LOGO from '@/assets/img/poweredby/infAI.png';
import L3S_LOGO from '@/assets/img/poweredby/L3S.png';
import LUH_LOGO from '@/assets/img/poweredby/LUH.png';
import TIB_LOGO from '@/assets/img/poweredby/TIB_Logo_EN.png';
import Logo from '@/assets/img/vertical_logo.svg';
import ROUTES from '@/constants/routes';
import ROUTES_CMS from '@/constants/routesCms';
import { reverse } from '@/lib/namedRoute';

const Footer = () => (
    <div className="mt-[75px] border-t separator--tertiary bg-surface-tertiary">
        <div className="mx-auto max-w-container px-3">
            <footer className="py-6">
                <h1 className="sr-only">More information about ORKG</h1>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                    <div className="my-2.5 text-[0.95rem] text-foreground-600 [&_a]:text-foreground-600 [&_a:hover]:text-foreground-800">
                        <h2 className="text-xl">ORKG</h2>
                        <Separator className="my-2 mr-12" variant="tertiary" />
                        <div className="flex items-start gap-3">
                            <div className="shrink-0">
                                <Link href={ROUTES.HOME}>
                                    <Image src={Logo} height="80" alt="Small ORKG logo" />
                                </Link>
                            </div>
                            <p className="text-[0.85rem]">
                                The Open Research Knowledge Graph aims to describe research papers in a structured manner
                            </p>
                        </div>
                    </div>
                    <div className="my-2.5 text-[0.95rem] text-foreground-600 [&_a]:text-foreground-600 [&_a:hover]:text-foreground-800">
                        <h2 className="text-xl">About</h2>
                        <Separator className="my-2 mr-12" variant="tertiary" />
                        <ul className="list-none space-y-1 p-0">
                            <li>
                                <Link href={reverse(ROUTES.ABOUT_NO_SLUG_ID, {})}>About us</Link>
                            </li>
                            <li>
                                <Link href={ROUTES.HELP_CENTER}>Help center</Link>
                            </li>
                            <li>
                                <a href="https://academy.orkg.org" target="_blank" rel="noreferrer">
                                    Academy
                                </a>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.DATA_PROTECTION })}>Data protection</Link>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.TERMS_OF_USE })}>Terms of use</Link>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.IMPRINT })}>Imprint</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="my-2.5 text-[0.95rem] text-foreground-600 [&_a]:text-foreground-600 [&_a:hover]:text-foreground-800">
                        <h2 className="text-xl">Technical</h2>
                        <Separator className="my-2 mr-12" variant="tertiary" />
                        <ul className="list-none space-y-1 p-0">
                            <li>
                                <Link href={ROUTES.DATA}>Data access</Link>
                            </li>
                            <li>
                                <Link href={ROUTES.CHANGELOG}>Changelog</Link>
                            </li>
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/" target="_blank" rel="noopener noreferrer">
                                    GitLab
                                </a>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.LICENSE })}>License</Link>
                            </li>
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/issues" target="_blank" rel="noopener noreferrer">
                                    Report issue
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="my-2.5 text-[0.95rem] text-foreground-600 [&_a]:text-foreground-600 [&_a:hover]:text-foreground-800">
                        <h2 className="text-xl">More</h2>
                        <Separator className="my-2 mr-12" variant="tertiary" />
                        <ul className="list-none space-y-1 p-0">
                            <li>
                                <a href="https://mastodon.social/@orkg" target="_blank" rel="noopener noreferrer">
                                    Follow us
                                    <FontAwesomeIcon className="ml-2" icon={faMastodon} />
                                </a>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.CONTACT })}>Contact us</Link>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.ACCESSIBILITY_STATEMENT })}>Accessibility</Link>
                            </li>
                            <li>
                                <a href="https://forms.gle/NK8Jzti8qGdRooDJ8" target="_blank" rel="noopener noreferrer">
                                    Report abuse
                                </a>
                            </li>
                            <li>
                                <i className="mr-4">Version</i>
                                <Chip size="sm" variant="soft">
                                    {process.env.version}
                                </Chip>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="mx-auto my-4 w-[70%]" variant="tertiary" />

                {/* Partner logos - first row */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
                    <a href="https://www.tib.eu/en/" target="_blank" rel="noopener noreferrer">
                        <Image src={TIB_LOGO} alt="Logo Technische Informationsbibliothek (TIB)" height="50" />
                    </a>
                    <a href="https://www.uni-hannover.de/en/" target="_blank" rel="noopener noreferrer">
                        <Image src={LUH_LOGO} alt="Logo Leibniz University Hannover" height="45" />
                    </a>
                    <a href="https://www.l3s.de/" target="_blank" rel="noopener noreferrer">
                        <Image src={L3S_LOGO} alt="Logo L3S Research Center" height="40" />
                    </a>
                    <a href="https://infai.org/en/" target="_blank" rel="noopener noreferrer">
                        <Image src={INFAI_LOGO} alt="Logo Institute for Applied Informatics (InfAI)" height="45" />
                    </a>
                </div>

                <Separator className="mx-auto my-4 w-[50%]" variant="tertiary" />

                {/* Funding logos - second row */}
                <div className="flex flex-wrap items-center justify-center gap-8">
                    <Image src={EU_LOGO} alt="Co-funded by the Horizon 2020 programme of the European Union" height="50" />
                    <a
                        href="https://marketplace.eosc-portal.eu/services/open-research-knowledge-graph-orkg"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image src={EOSC_LOGO} alt="European Open Science Cloud (EOSC)" height="45" />
                    </a>
                </div>
            </footer>
        </div>
    </div>
);

export default Footer;
