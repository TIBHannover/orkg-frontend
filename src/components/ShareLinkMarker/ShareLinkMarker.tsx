'use client';

import { faFacebook, faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faCopy, faShareNodes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonProps, Input, Popover, TextField, toast, Tooltip } from '@heroui/react';
import { usePathname } from 'next/navigation';
import { AnchorHTMLAttributes, useMemo, useRef, useState } from 'react';

import { getFacebookSharerLink, getLinkedInSharerLink, getTwitterSharerLink } from '@/components/ShareLinkMarker/helpers';

type ShareTarget = {
    key: string;
    label: string;
    icon: IconDefinition;
    href: string;
    buttonClasses: string;
};

type ShareLinkMarkerProps = {
    typeOfLink: string;
    title: string;
    /** Override the URL being shared. Defaults to the current origin + pathname. */
    shareUrl?: string;
    /** Forwarded to the trigger Button — use for className, size, isIconOnly, etc. */
    buttonProps?: Partial<ButtonProps>;
    /** Render the trigger as an icon-only button. Useful inside dense toolbars. */
    iconOnly?: boolean;
    /** Popover placement. */
    placement?: 'bottom end' | 'bottom start' | 'bottom' | 'top end' | 'top start' | 'top';
};

const ShareLinkMarker = ({ typeOfLink, title, shareUrl, buttonProps, iconOnly = false, placement = 'bottom end' }: ShareLinkMarkerProps) => {
    const [recentlyCopied, setRecentlyCopied] = useState(false);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pathname = usePathname();

    const resolvedShareUrl = useMemo(() => {
        if (shareUrl) return shareUrl;
        if (typeof window === 'undefined') return '';
        return `${window.location.protocol}//${window.location.host}${pathname}`;
    }, [shareUrl, pathname]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(resolvedShareUrl);
            toast.clear();
            toast.success('Link copied to clipboard');
            setRecentlyCopied(true);
            if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
            resetTimerRef.current = setTimeout(() => setRecentlyCopied(false), 1800);
        } catch {
            toast.danger('Failed to copy link');
        }
    };

    const shareTargets: ShareTarget[] = useMemo(
        () => [
            {
                key: 'twitter',
                label: 'X',
                icon: faXTwitter,
                href: getTwitterSharerLink({ shareUrl: resolvedShareUrl, title }),
                buttonClasses: 'bg-black text-white hover:bg-black/85 data-[hovered=true]:bg-black/85 focus-visible:ring-black/40',
            },
            {
                key: 'facebook',
                label: 'Facebook',
                icon: faFacebook,
                href: getFacebookSharerLink({ shareUrl: resolvedShareUrl }),
                buttonClasses: 'bg-[#1877F2] text-white hover:bg-[#166FE0] data-[hovered=true]:bg-[#166FE0] focus-visible:ring-[#1877F2]/40',
            },
            {
                key: 'linkedin',
                label: 'LinkedIn',
                icon: faLinkedin,
                href: getLinkedInSharerLink({ shareUrl: resolvedShareUrl }),
                buttonClasses: 'bg-[#0A66C2] text-white hover:bg-[#0959AB] data-[hovered=true]:bg-[#0959AB] focus-visible:ring-[#0A66C2]/40',
            },
        ],
        [resolvedShareUrl, title],
    );

    const triggerAriaLabel = `Share this ${typeOfLink || 'page'}`;

    return (
        <Popover>
            <Button size="sm" aria-label={triggerAriaLabel} isIconOnly={iconOnly} {...buttonProps}>
                <FontAwesomeIcon icon={faShareNodes} className={iconOnly ? undefined : 'mr-1'} />
                {!iconOnly && 'Share'}
            </Button>
            <Popover.Content placement={placement}>
                <Popover.Dialog className="w-[22rem] max-w-[92vw] p-4">
                    <Popover.Arrow />
                    <Popover.Heading className="text-base font-semibold leading-tight">Share this {typeOfLink || 'page'}</Popover.Heading>
                    <p className="mt-1 text-xs text-muted">Copy the direct link or publish it to a social channel.</p>

                    <div className="mt-3 flex h-9 items-stretch">
                        <TextField aria-label={`Link to this ${typeOfLink || 'page'}`} className="min-w-0 flex-1">
                            <Input
                                readOnly
                                value={resolvedShareUrl}
                                onFocus={(event) => event.currentTarget.select()}
                                className="!h-9 !rounded-e-none font-mono text-xs"
                            />
                        </TextField>
                        <Button
                            size="sm"
                            variant={recentlyCopied ? 'primary' : 'secondary'}
                            aria-label="Copy link to clipboard"
                            className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px"
                            onPress={handleCopy}
                        >
                            <FontAwesomeIcon icon={recentlyCopied ? faCheck : faCopy} className="mr-1" />
                            {recentlyCopied ? 'Copied' : 'Copy'}
                        </Button>
                    </div>

                    <div className="mt-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Or share on</p>
                        <div className="flex gap-1.5">
                            {shareTargets.map(({ key, icon, label, href, buttonClasses }) => (
                                <Tooltip key={key} delay={300}>
                                    <Button
                                        size="sm"
                                        aria-label={`Share on ${label}`}
                                        className={`flex-1 justify-center gap-1.5 px-2 ${buttonClasses}`}
                                        render={(props) => (
                                            <a
                                                {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            />
                                        )}
                                    >
                                        <FontAwesomeIcon icon={icon} className="text-base" />
                                        <span className="text-xs font-medium">{label}</span>
                                    </Button>
                                    <Tooltip.Content>Share on {label} (opens in a new tab)</Tooltip.Content>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
};

export default ShareLinkMarker;
