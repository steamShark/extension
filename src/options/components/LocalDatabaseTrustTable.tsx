import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { TableRow, TableCell } from "../../components/ui/table";
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis,
} from "../../components/ui/pagination";
import { Button } from "../../components/ui/button";
import { ExternalLink } from "lucide-react";
import { LOCAL_DATABASE_TRUST_PAGE_SIZE } from "@/common/defaults";
import { TrustItem } from "@/common/interfaces";

export function LocalDatabaseTrustTable({ trustItems }: { trustItems: TrustItem[] }) {
    const [page, setPage] = useState(1);

    const pageCount = Math.max(1, Math.ceil(trustItems.length / LOCAL_DATABASE_TRUST_PAGE_SIZE));
    const clampedPage = Math.min(page, pageCount);

    const pageItems = useMemo(() => {
        const start = (clampedPage - 1) * LOCAL_DATABASE_TRUST_PAGE_SIZE;
        return trustItems.slice(start, start + LOCAL_DATABASE_TRUST_PAGE_SIZE);
    }, [trustItems, clampedPage]);

    const pageNumbers = useMemo(() => {
        const maxShown = 5;
        if (pageCount <= maxShown) return Array.from({ length: pageCount }, (_, i) => i + 1);
        const start = Math.max(1, Math.min(clampedPage - 2, pageCount - (maxShown - 1)));
        return Array.from({ length: maxShown }, (_, i) => start + i);
    }, [clampedPage, pageCount]);

    const lastPageNumber = pageNumbers[pageNumbers.length - 1];

    return (
        <>
            {pageItems.map((item, i) => (
                <TableRow key={`${item.url}-${i}`} className="w-full">
                    {/* WEBSITE */}
                    <TableCell className="w-2/6">
                        <span className="font-medium break-all">{item.url}</span>
                    </TableCell>

                    {/* DESCRIPTION */}
                    <TableCell className="w-2/6">
                        <span className="text-muted-foreground text-sm">{item.description}</span>
                    </TableCell>

                    {/* DETAILS */}
                    <TableCell className="w-1/6">
                        <Button disabled variant="ghost" className="flex items-center gap-2 cursor-pointer hover:bg-background/50">
                            <Link to={`http://localhost:8080/website/${encodeURIComponent(item.url)}`}>
                                <ExternalLink className="text-muted-foreground w-3 h-3" />
                                <span className="text-sm text-muted-foreground">Details</span>
                            </Link>
                        </Button>
                    </TableCell>
                </TableRow>
            ))}

            {/* PAGINATION */}
            <tr>
                <td colSpan={4}>
                    <Pagination className="mt-4">
                        <PaginationContent className="mx-auto">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className={clampedPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            {pageCount > 5 && pageNumbers[0] > 1 && (
                                <>
                                    <PaginationItem>
                                        <PaginationLink onClick={() => setPage(1)} isActive={clampedPage === 1}>
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                    {pageNumbers[0] > 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                                </>
                            )}

                            {pageNumbers.map((n) => (
                                <PaginationItem key={n}>
                                    <PaginationLink onClick={() => setPage(n)} isActive={clampedPage === n}>
                                        {n}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            {pageCount > 5 && lastPageNumber < pageCount && (
                                <>
                                    {lastPageNumber < pageCount - 1 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                                    <PaginationItem>
                                        <PaginationLink onClick={() => setPage(pageCount)} isActive={clampedPage === pageCount}>
                                            {pageCount}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                                    className={clampedPage === pageCount ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Showing {(clampedPage - 1) * LOCAL_DATABASE_TRUST_PAGE_SIZE + 1}–
                        {Math.min(clampedPage * LOCAL_DATABASE_TRUST_PAGE_SIZE, trustItems.length)} of {trustItems.length}
                    </p>
                </td>
            </tr>
        </>
    );
}
