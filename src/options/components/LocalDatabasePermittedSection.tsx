import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Label } from "@radix-ui/react-label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CircleCheck } from "lucide-react";
import { permittedActions } from "../interfaces";
import LocalDatabasePermittedTable from "./tables/LocalDatabasePermittedTable";
import { PermittedItem, PermittedStore } from "@/common/interfaces";

type PermittedSectionProps = {
    setPermittedWebsite: (value: string) => void;
    permittedAction: string;
    setPermittedAction: (value: string) => void;
    expirationDate: string;
    setExpirationDate: (value: string) => void;
    addPermittedItem: () => void;
    databasePermitted: PermittedStore | null;
    handleRemove: (item: PermittedItem) => void;
};


export default function LocalDatabasePermittedSection({ setPermittedWebsite, permittedAction, setPermittedAction, expirationDate, setExpirationDate, addPermittedItem, databasePermitted, handleRemove }: PermittedSectionProps) {
    //Tommor Date for default value of permitted item
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
        <section className="flex flex-col gap-5">
            <Card>
                <CardHeader className="flex flex-col items-start gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <CircleCheck className="icon-primary w-4 h-4" />
                        <h3 className="text-xl font-bold">Permitted Actions</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Permitted Items surpass the local database verifications!</p>
                </CardHeader>
                <CardContent className="flex flex-row items-center gap-5">
                    <div className="grid w-full max-w-sm items-center gap-3 w-3/6">
                        <Label htmlFor="websiteURL">Website Url</Label>
                        <Input type="text" placeholder="Website URL" onChange={(e) => setPermittedWebsite(e.target.value)} />{/* value={permittedWebsite} onValueChange={setPermittedWebsite} */}
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-3 w-1/6">
                        <Label htmlFor="action">Action</Label>
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
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-3 w-1/6">
                        <Label htmlFor="expirationDateTime">Expiration Date</Label>
                        <Input
                            type="datetime-local"
                            value={
                                expirationDate
                                    ? new Date(Number(expirationDate)).toISOString().slice(0, 16)
                                    : tomorrow.toISOString().slice(0, 16) // default tomorrow
                            }
                            onChange={(e) => {
                                const isoString = e.target.value;
                                const epochMs = new Date(isoString).getTime();
                                setExpirationDate(String(epochMs));
                            }}
                        />
                    </div>
                    <Button className="w-1/6 cursor-pointer" onClick={addPermittedItem}>
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
                                <TableHead>Action</TableHead>
                                <TableHead>Expires At</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {databasePermitted === null ? (
                                <div>
                                    Nothing found
                                </div>
                            ) : (
                                <LocalDatabasePermittedTable permittedItems={databasePermitted.data} onRemove={handleRemove} />
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    )
}