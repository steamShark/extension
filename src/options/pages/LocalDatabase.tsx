import { CircleCheck, Database, Download, ExternalLink, Funnel, History, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { categoryOptions, permittedActions, trustWorthyOptions } from "../interfaces";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Link } from "react-router";
import { PermittedItem, ScamStore, TrustItem, TrustStore } from "@/common/interfaces";

export default function WebsitesList() {
    /* GET FROM LOCAL STORAGE */
    const [databaseScam, setDatabaseScam] = useState<ScamStore | null>(null);
    const [databaseTrust, setDatabaseTrust] = useState<TrustStore | null>(null);
    const [databasePermitted, setDatabasePermitted] = useState<PermittedItem[] | null>(null);
    const [pattern, setPattern] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTrustWorthy, setSelectedTrustWorthy] = useState<string>('all');
    const [permittedAction, setPermittedAction] = useState<string>('add');

    useEffect(() => {
        /* SCAM WEBSITES */
        chrome.storage.local.get(["scamWebsites"]).then((res) => {
            if (res && res.scamWebsites) {
                try {
                    const data: ScamStore = JSON.parse(res.scamWebsites);
                    setDatabaseScam(data);
                } catch (e) {
                    console.error("Failed to parse settings:", e);
                }
            }
        });

        /* TRUST WEBSITES */
        chrome.storage.local.get(["trustWebsites"]).then((res) => {
            if (res && res.trustWebsites) {
                try {
                    const data: TrustStore = JSON.parse(res.trustWebsites);
                    setDatabaseTrust(data);
                } catch (e) {
                    console.error("Failed to parse settings:", e);
                }
            }
        });

        /* PERMITTED WEBSITES */
        chrome.storage.local.get(["permittedWebistes"]).then((res) => {
            if (res && res.permittedWebistes) {
                try {
                    const data: PermittedItem[] = JSON.parse(res.permittedWebistes).data;
                    setDatabasePermitted(data);
                } catch (e) {
                    console.error("Failed to parse settings:", e);
                }
            }
        });
    }, []);

    /* const add = () => {
        if (!pattern.trim()) return;
        const next = [...sites, { pattern: pattern.trim(), mode }];
        setDatabase(next);
        setPattern("");
    };

    const remove = (idx: number) => {
        const next = sites.slice();
        next.splice(idx, 1);
        setSites(next);
    }; */

    const databaseEntries = [
        {
            id: 1,
            domain: 'steamcommunity.com',
            category: 'trusted',
            status: 'safe',
            lastUpdated: '2024-01-15',
            reportCount: 0,
            description: 'Official Steam Community website'
        },
        {
            id: 2,
            domain: 'suspicious-steam-site.com',
            category: 'malicious',
            status: 'dangerous',
            lastUpdated: '2024-01-14',
            reportCount: 156,
            description: 'Phishing site mimicking Steam login'
        },
        {
            id: 3,
            domain: 'steam-trades.net',
            category: 'trading',
            status: 'safe',
            lastUpdated: '2024-01-13',
            reportCount: 2,
            description: 'Legitimate Steam trading platform'
        },
        {
            id: 4,
            domain: 'fake-steam-login.org',
            category: 'malicious',
            status: 'dangerous',
            lastUpdated: '2024-01-12',
            reportCount: 203,
            description: 'Known phishing site'
        },
        {
            id: 5,
            domain: 'steamdb.info',
            category: 'tools',
            status: 'safe',
            lastUpdated: '2024-01-11',
            reportCount: 0,
            description: 'Steam database and statistics'
        },
        {
            id: 6,
            domain: 'steam-scam-example.net',
            category: 'malicious',
            status: 'dangerous',
            lastUpdated: '2024-01-10',
            reportCount: 89,
            description: 'Fake Steam marketplace'
        }
    ];

    if(!databaseScam || !databaseTrust){
        return null;
    }

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
                                <TableHead>Action</TableHead>
                                <TableHead>Domain</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>

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
            <div className="flex flex-row gap-5 items-start">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="icon-primary w-5 h-5" />
                            <h3 className="text-xl font-bold">Local Database</h3>
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
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {databaseScam && databaseScam.data.map((item: string, index) => (
                                    <TableRow key={index} className="w-full">
                                        {/* WEBSITE */}
                                        <TableCell className="w-3/6">
                                            <span className="font-medium">{item}</span>
                                        </TableCell>
                                        {/* STEAMSHARK WWBSITE PAGE */}
                                        <TableCell className="w-1/6">
                                            <Button disabled variant="ghost" className="flex items-center gap-2 cursor-pointer hover:bg-background/50">
                                                <Link to={`http://localhost:8080/website/${item}`}>
                                                    <ExternalLink className="text-muted-foreground w-3 h-3" />
                                                    <span className="text-sm text-muted-foreground">Details</span>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="icon-primary w-5 h-5" />
                            <h3 className="text-xl font-bold">Local Database</h3>
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
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {databaseTrust && databaseTrust.data.map((item: TrustItem, index) => (
                                    <TableRow key={index} className="w-full">
                                        {/* WEBSITE */}
                                        <TableCell className="w-3/6">
                                            <span className="font-medium">{item.url}</span>
                                        </TableCell>
                                        {/* STEAMSHARK WWBSITE PAGE */}
                                        <TableCell className="w-1/6">
                                            <Button disabled variant="ghost" className="flex items-center gap-2 cursor-pointer hover:bg-background/50">
                                                <Link to={`http://localhost:8080/website/${item.url}`}>
                                                    <ExternalLink className="text-muted-foreground w-3 h-3" />
                                                    <span className="text-sm text-muted-foreground">Details</span>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
