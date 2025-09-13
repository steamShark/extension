import { CircleOff, Download, Funnel, HistoryIcon, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HistoryItem, HistoryStore, SettingsData } from "@/common/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trustWorthyOptions } from "../interfaces";
import { ResetHistoryConfirm } from "../components/ResetHistoryConfirm";
import { defaultHistoryStore } from "@/common/defaults";
import { toast } from "sonner"
import HistoryDataTable from "../components/HistoryDataTable";
import { HistoryErrorState } from "../components/HistoryErrorLoadingPage";

export default function History() {
    const [history, setHistory] = useState<HistoryItem[] | null>(null);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    /* FILTERS AND ACTIONS */
    const [selectedTrustWorthy, setSelectedTrustWorthy] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(false);

    async function loadHistory() {
        setLoading(true);
        try {
            try {
                /* GET HISTORY */
                chrome.storage.local.get(["historyWebsites"]).then((res) => {
                    if (res && res.historyWebsites) {
                        try {
                            const data: HistoryStore = JSON.parse(res.historyWebsites)
                            setHistory(data.data as HistoryItem[])
                            return data.data as HistoryItem[]
                        } catch (e) {
                            console.error("Failed to parse settings:", e);
                        }
                    }
                });

                /* GET SETTINGS */
                chrome.storage.local.get(["settings"]).then((res) => {
                    if (res && res.settings) {
                        try {
                            const data: SettingsData = JSON.parse(res.settings).data;
                            setSettings(data);
                        } catch (e) {
                            console.error("Failed to parse settings:", e);
                        }
                    }
                });
            } catch (e) {
                console.error("Failed to parse settings:", e);
            }
        } catch (e) {
            console.error("Failed to load settings", e);
            setHistory(null);
            setSettings(null);
        } finally {
            setLoading(false);
        }
    }

    /* Get Settings from localstorage */
    useEffect(() => {
        loadHistory()
    }, []);

    /* Function that is responsible to reset the History */
    function resetHistory() {
        try {
            chrome.storage.local.set({ historyWebsites: JSON.stringify(defaultHistoryStore) }).then(() => {
                console.log(`🦈steamShark[BG Service]: History Storage cleared.`);
            });
            //Inject popup/toaster of success
            toast.success("History has been cleaned.")
            /* RESET LOCAL OBJECT */
            setHistory([]);
        } catch (err) {
            //Inject popup/toaster of error 
            toast.error("An error occured while cleaning history.", {
                description: 'You can see the error in console',
            })
            console.log("🦈steamShark error: " + err)
        }
    }

    /* Function to refresh history */
    function refreshHistory() {
        try {
            chrome.storage.local.get(["historyWebsites"]).then((res) => {
                if (!res || res === null) {
                    return null
                }

                const data: HistoryStore = JSON.parse(res.historyWebsites)
                setHistory(data.data as HistoryItem[])
                //Inject popup/toaster of error 
                toast.success("Data was refreshed.")
            });
        } catch (err) {
            //Inject popup/toaster of error 
            toast.error("An error occured while refreshing history.", {
                description: 'You can see the error in console',
            })
            console.log("🦈steamShark error: " + err)
        }
    }

    if (history === null || !settings) {
        return (
            <HistoryErrorState
                onRetry={loadHistory}
                showLoading={loading}
            />
        );
    }

    return (
        <section className="container flex flex-col gap-5">
            {/* HEADER */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center text-3xl font-bold gap-2">
                    <HistoryIcon className="icon-primary w-5 h-5" />
                    <h2>History</h2>
                </div>
                <p className="text-muted-foreground">
                    Verify last Steam related websites you visited
                </p>
            </div>
            {/* Info part */}
            <div className="flex flex-row gap-5 w-full">
                <Card className="w-1/3">
                    <CardHeader className="text-lg font-semibold">
                        Total History
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <div className="flex flex-row items-center gap-2">
                            <p className="text-3xl font-bold text-primary">{history.length}</p>
                            <span className="text-sm text-white">/ {settings.maxHistoryEntries}</span>
                        </div>

                        <p className="text-sm text-muted-foreground">Items</p>
                    </CardContent>
                </Card>
                <Card className="w-1/3">
                    <CardHeader className="text-lg font-semibold">
                        Safe Websites
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <p className="text-3xl font-bold text-success">5</p>
                        <p className="text-sm text-muted-foreground">Verified Secure</p>
                    </CardContent>
                </Card>
                <Card className="w-1/3">
                    <CardHeader className="text-lg font-semibold">
                        Threads Blocked
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <p className="text-3xl font-bold text-destructive">5</p>
                        <p className="text-sm text-muted-foreground">Malicious Websites</p>
                    </CardContent>
                </Card>
            </div>
            {/* Filters */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <Funnel className="icon-primary w-4 h-4" />
                    <h3 className="text-xl font-bold">Filters</h3>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    {/* SELECT TRUSTWORTHY */}
                    <Select value={selectedTrustWorthy} onValueChange={setSelectedTrustWorthy}>
                        <SelectTrigger className="md:w-48 cursor-pointer">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>

                        <SelectContent>
                            {trustWorthyOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* OPTIONS BUTTONS */}
                    <div className="flex gap-2">
                        {/* REMOVE HISTORY */}
                        <ResetHistoryConfirm onConfirm={resetHistory} />

                        <Button variant="secondary" className="flex items-center gap-3 cursor-pointer" onClick={refreshHistory}>
                            <RefreshCw className="icon-primary w-5 h-5" />
                            <span>Refresh</span>
                        </Button>

                        <Button disabled variant="secondary" className="flex items-center gap-3 cursor-pointer">
                            <Download className="icon-primary w-5 h-5" />
                            <span>Export</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* TABLE */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="text-xl font-bold">Recent Activity</h3>
                    <p>A total of <span className="font-bold">{history.length}</span> out of <span className="font-bold">{settings.maxHistoryEntries}</span>.</p>
                </CardHeader>
                <CardContent>
                    {history === null || history.length === 0 ? (
                        <div className="w-full flex flex-row items-center gap-3 justify-center">
                            <CircleOff className="icon-primaet 2-5 h-5" />
                            <p className="text-xl font-bold">No history to show!</p>
                        </div>
                    ) : (
                        <Table>
                            <TableCaption>A list of your recent steam related websites.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Website</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>

                                <HistoryDataTable history={history} />
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
