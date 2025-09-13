import { CircleCheck, Database, Download, Funnel, History, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { categoryOptions, permittedActions, trustWorthyOptions } from "../interfaces";
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { PermittedItem, PermittedStore, ScamStore, TrustStore } from "@/common/interfaces";
import LocalDatabaseScamTable from "../components/LocalDatabaseScamTable";
import { LocalDatabaseTrustTable } from "../components/LocalDatabaseTrustTable";
import { LocalDatabaseErrorState } from "../components/LocalDatabaseErrorLoadingPage";
import LocalDatabasePermittedable from "../components/LocalDatabasePermittedTable";

export default function WebsitesList() {
    /* GET FROM LOCAL STORAGE */
    const [databaseScam, setDatabaseScam] = useState<ScamStore | null>(null);
    const [databaseTrust, setDatabaseTrust] = useState<TrustStore | null>(null);
    const [databasePermitted, setDatabasePermitted] = useState<PermittedStore | null>(null);
    /*const [pattern, setPattern] = useState(""); */
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTrustWorthy, setSelectedTrustWorthy] = useState<string>('all');
    const [permittedAction, setPermittedAction] = useState<string>('add');
    const [loading, setLoading] = useState<boolean>(false);

    async function loadLocalDatabases() {
        setLoading(true);
        try {
            chrome.storage.local.get(["scamWebsites"]).then((res) => {
                if (res && res.scamWebsites) {
                    try {
                        const data: ScamStore = JSON.parse(res.scamWebsites);
                        setDatabaseScam(data);
                    } catch (e) {
                        console.error("Failed to parse trsut websites:", e);
                    }
                }
            });

            chrome.storage.local.get(["trustWebsites"]).then((res) => {
                if (res && res.trustWebsites) {
                    try {
                        const data: TrustStore = JSON.parse(res.trustWebsites);
                        setDatabaseTrust(data);
                    } catch (e) {
                        console.error("Failed to parse trsut websites:", e);
                    }
                }
            });

            chrome.storage.local.get(["permittedWebsites"]).then((res) => {
                if (res && res.permittedWebsites) {
                    try {
                        const data: PermittedStore = JSON.parse(res.permittedWebsites);
                        setDatabasePermitted(data);
                    } catch (e) {
                        console.error("Failed to parse settings:", e);
                    }
                }
            });
        } catch (e) {
            console.error("Failed to load settings", e);
            setDatabaseScam(null);
            setDatabaseTrust(null);
            setDatabasePermitted(null);
        } finally {
            setLoading(false);
        }
    }

    async function updateDatabase(permittedDatabase: PermittedStore) {
        try {
            chrome.storage.local.set({ permittedWebsites: JSON.stringify(permittedDatabase) });
        } catch (error) {

        }
    }

    useEffect(() => {
        loadLocalDatabases();
    });

    if (!databaseScam || !databaseTrust || !databasePermitted) {
        return (
            <LocalDatabaseErrorState
                onRetry={loadLocalDatabases}
                showLoading={loading}
            />
        );
    }


    async function removePermittedItem(target: PermittedItem): Promise<PermittedStore> {
        // build the next store immutably
        const nextStore: PermittedStore = {
            description: databasePermitted? databasePermitted.description : "",
            data: (databasePermitted?.data ?? []).filter(
                it => !(it.url === target.url && it.expiresAt === target.expiresAt) // url+expiresAt as key
            ),
        };

        // persist to storage (await for reliability)
        await chrome.storage.local.set({ permittedWebsites: JSON.stringify(nextStore) });

        return nextStore;
    }

    const handleRemove = async (item: PermittedItem) => {
        const next = await removePermittedItem(item);
        updateDatabase(next);
    };

    const stats = {
        total: databaseScam.data.length + databaseTrust.data.length,
        safe: databaseTrust.data.length,
        dangerous: databaseScam.data.length,
    };

    return (
        <section className="container flex flex-col gap-5">
            {/* HEADER */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center text-3xl font-bold gap-2">
                    <Database className="icon-primary w-5 h-5" />
                    <h2>Local Database</h2>
                </div>
                <p className="text-muted-foreground">
                    Configure your steamShark extension preferences
                </p>
            </div>
            {/* Info part */}
            <div className="flex flex-row gap-5 w-full">
                <Card className="w-1/3">
                    <CardHeader className="text-lg font-semibold">
                        Total Entries
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <p className="text-3xl font-bold text-primary">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">in database</p>
                    </CardContent>
                </Card>
                <Card className="w-1/3">
                    <CardHeader className="text-lg font-semibold">
                        Safe
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <p className="text-3xl font-bold text-success">{stats.safe}</p>
                        <p className="text-sm text-muted-foreground">Verified Secure</p>
                    </CardContent>
                </Card>
                <Card className="w-1/3">
                    <CardHeader className="text-lg font-semibold">
                        Threads
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <p className="text-3xl font-bold text-destructive">{stats.dangerous}</p>
                        <p className="text-sm text-muted-foreground">Malicious Websites</p>
                    </CardContent>
                </Card>
                <Card className="w-1/3">
                    <CardHeader className="text-lg font-semibold">
                        Permitted
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <p className="text-3xl font-bold text-destructive">{databasePermitted.data.length}</p>
                        <p className="text-sm text-muted-foreground">Websites</p>
                    </CardContent>
                </Card>
            </div>
            {/* PERMITTED ACTIONS */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <CircleCheck className="icon-primary w-4 h-4" />
                    <h3 className="text-xl font-bold">Permitted Actions</h3>
                </CardHeader>
                <CardContent className="flex flex-row items-center gap-5">
                    <Input className="w-5/6" />
                    <Select value={permittedAction} onValueChange={setPermittedAction}>
                        <SelectTrigger className="md:w-48 cursor-pointer w-1/6">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>

                        <SelectContent>
                            {permittedActions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button className="w-1/6 cursor-pointer">
                        Add
                    </Button>
                </CardContent>
            </Card>
            {/* PERMITTED LIST */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <CircleCheck className="icon-primary w-4 h-4" />
                    <h3 className="text-xl font-bold">Permitted List</h3>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>A list of permitted websites in local database.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Domain</TableHead>
                                <TableHead>Expires At</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <LocalDatabasePermittedable permittedItems={databasePermitted.data} onRemove={handleRemove} />
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Filters */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <Funnel className="icon-primary w-4 h-4" />
                    <h3 className="text-xl font-bold">Filters</h3>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search domains or descriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12"
                        />
                    </div>
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
                    {/* SELECT CATEGORY */}
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="md:w-48 cursor-pointer">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>

                        <SelectContent >
                            {categoryOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* OPTIONS BUTTONS */}
                    <div className="flex gap-2">
                        <Button variant="secondary" className="flex items-center gap-3 cursor-pointer">
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

            {/* Database */}
            <div className="flex flex-col gap-5">
                {/* TRUSTED TABLE */}
                <Card className="w-100%">
                    <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="icon-primary w-5 h-5" />
                            <h3 className="text-xl font-bold">Local Trusted Websites Database</h3>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <History className="icon-primary w-3 h-3" />
                            <p>Last Update:</p>
                            {databaseTrust?.lastCheckup}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableCaption>A list of trusted websites in local database.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <LocalDatabaseTrustTable trustItems={databaseTrust.data} />
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {/* NOT TRUSTED TABLE */}
                <Card className="w-100%">
                    <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="icon-primary w-5 h-5" />
                            <h3 className="text-xl font-bold">Local Not Trusted Webistes Database</h3>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <History className="icon-primary w-3 h-3" />
                            <p>Last Update:</p>
                            {databaseTrust?.lastCheckup}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableCaption>A list of scam websites in local database.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <LocalDatabaseScamTable scamItems={databaseScam.data} />
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
