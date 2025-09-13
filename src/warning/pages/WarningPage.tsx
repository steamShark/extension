// src/warning/WarningPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { AlertTriangle, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import Footer from "../components/Footer";
import { HistoryStore, PermittedStore, SettingsStore } from "@/common/interfaces";

function getJSON<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (res) => {
            try {
                resolve(res[key] ? JSON.parse(res[key]) as T : null);
            } catch {
                resolve(null);
            }
        });
    });
}

function domainFromQuery(): string | null {
    try {
        const u = new URL(window.location.href).searchParams.get("u");
        return u && u.trim() ? u.trim() : null;
    } catch {
        return null;
    }
}

function lastDomainFromHistory(hist: HistoryStore | null): string | null {
    const list = hist?.data ?? [];
    for (let i = list.length - 1; i >= 0; i--) {
        const u = list[i]?.url ?? "";
        if (!/^https?:\/\//i.test(u)) return u;
    }
    return null;
}

export default function WarningPage() {
    const [domain, setDomain] = useState<string>("");

    // load domain from ?u=… or fallback to history
    useEffect(() => {
        (async () => {
            const fromQuery = domainFromQuery();
            if (fromQuery) {
                setDomain(fromQuery);
                return;
            }
            const hist = await getJSON<HistoryStore>("historyWebsites");
            const last = lastDomainFromHistory(hist);
            if (last) setDomain(last);
        })();
    }, []);

    const prettyDomain = useMemo(() => domain || "WEBSITE NAME", [domain]);

    const handleBackToSafety = useCallback(() => {
        // Prefer replacing current tab with a neutral page
        chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
            const id = tabs[0]?.id;
            if (id) chrome.tabs.update(id, { url: "http://localhost:8080" });
            else window.location.href = "http://localhost:8080";
        });
    }, []);

    const handleProceed = useCallback(async () => {
        try {
            const [permitted, settings] = await Promise.all([
                getJSON<PermittedStore>("permittedWebsites"),
                getJSON<SettingsStore>("settings"),
            ]);

            const duration =
                settings?.data?.ignoreScamSiteDurationMs ??
                settings?.data?.ignoreScamSiteDurationMs ?? // tolerate older key
                5 * 60_000; // fallback 5 min

            const entry = { url: domain, expiresAt: Date.now() + duration };
            const next: PermittedStore = { description: permitted?.description as string, data: [...(permitted?.data ?? []), entry] };

            await chrome.storage.local.set({ permittedWebsites: JSON.stringify(next) });

            // Go to the risky site in THIS tab
            const target = domain.startsWith("http") ? domain : `https://${domain}`;
            window.location.replace(target);
        } catch (e) {
            console.error("steamShark: proceed failed", e);
        }
    }, [domain]);

    /* const copyDomain = async () => {
        try {
            await navigator.clipboard.writeText(domain);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { }
    }; */

    return (
        <div className="min-h-screen w-full flex flex-col">
            {/* center */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl text-center space-y-6">

                    {/* emblem */}
                    <div className="relative mx-auto h-20 w-20 rounded-full bg-background/80 cursor-pointer grid place-items-center shadow-lg overflow-visible
                motion-safe:animate-pulse-scale">
                        {/* expanding ring */}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-full ring-3 ring-background/25 motion-safe:animate-pulse-ring"
                        />
                        {/* inner disc */}
                        <div className="h-14 w-14 rounded-full bg-card grid place-items-center shadow-inner">
                            <span className="text-3xl" role="img" aria-label="shark">🦈</span>
                        </div>
                    </div>

                    {/* title */}
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        <span className="opacity-90">{prettyDomain}</span>{" "}
                        <span className="opacity-100">is a scam page!</span>
                    </h1>

                    {/* explanation */}
                    <p className="mx-auto max-w-xl text-white/90">
                        This page might not be safe. Be cautious of any suspicious links or requests for personal information.
                    </p>

                    {/* helper row: domain chip + copy */}
                    {domain && (
                        <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-sm font-medium">
                                <Shield className="h-4 w-4 opacity-75" />
                                {domain}
                            </span>

                            <Button variant="link">
                                <a href={`http://localhost:8080/website/${prettyDomain}`} className="flex flex-row gap-2 text-muted-foreground hover:text-foreground cursor-pointer" >
                                    <ExternalLink className=" w-5 h-5" />
                                    <p>Details</p>
                                </a>
                            </Button>
                        </div>
                    )}

                    {/* actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button id="back-btn" onClick={handleBackToSafety} className="h-10 px-5 font-semibold cursor-pointer">
                            Back to safety
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    id="continue-btn"
                                    variant="destructive"
                                    className="h-10 px-5 font-semibold inline-flex items-center gap-2 cursor-pointer"
                                >
                                    Continue anyway
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="inline-flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        Proceed to {domain || "this site"}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        We’ll temporarily allow this site and redirect you. Avoid entering your Steam credentials or
                                        sensitive information. You can change this behavior later in Settings.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleProceed} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Yes, continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* tips */}
                    <ul className="mx-auto max-w-xl text-left text-sm text-white/90 space-y-2 pt-2">
                        <li className="list-disc list-inside">Always check the domain before logging in with Steam.</li>
                        <li className="list-disc list-inside">Never share your Steam Guard codes or recovery codes.</li>
                        <li className="list-disc list-inside">When in doubt, close the tab and access Steam via bookmarks only.</li>
                    </ul>
                </div>
            </div>

            {/* footer */}
            <Footer />
        </div>
    );
}
