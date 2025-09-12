import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    TableRow, TableCell,
} from "./ui/table";
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis,
} from "./ui/pagination";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { HISTORY_PAGE_SIZE } from "@/common/defaults";

export default function HistoryDataTable({ history }: { history: Array<{ url: string; timestamp: string; status?: string }> }) {
    const [page, setPage] = useState(1);

    const pageCount = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
    const clampedPage = Math.min(page, pageCount);

    const pageItems = useMemo(() => {
        const start = (clampedPage - 1) * HISTORY_PAGE_SIZE;
        return history.slice(start, start + HISTORY_PAGE_SIZE);
    }, [history, clampedPage]);

    // small helper for numbered links (windowed)
    const pageNumbers = useMemo(() => {
        const maxShown = 5;
        if (pageCount <= maxShown) return Array.from({ length: pageCount }, (_, i) => i + 1);
        const start = Math.max(1, Math.min(clampedPage - 2, pageCount - (maxShown - 1)));
        return Array.from({ length: maxShown }, (_, i) => start + i);
    }, [clampedPage, pageCount]);

    const lastPageNumber = pageNumbers[pageNumbers.length - 1];
    return (
        <>
            {/* TABLE ROWS */}
            {pageItems.map((item, idx) => (
                <TableRow key={`${item.url}-${item.timestamp}-${idx}`} className="w-full">
                    {/* STATUS */}
                    <TableCell className="w-1/6">{/* add status badge/icon here if you want */}</TableCell>

                    {/* WEBSITE */}
                    <TableCell className="w-3/6">
                        <span className="font-medium">{item.url}</span>
                    </TableCell>

                    {/* TIMESTAMP */}
                    <TableCell className="w-1/6">
                        <span className="text-muted-foreground">{item.timestamp}</span>
                    </TableCell>

                    {/* STEAMSHARK WEBSITE PAGE */}
                    <TableCell className="w-1/6">
                        <Button variant="ghost" className="flex items-center gap-2 cursor-pointer hover:bg-background/50">
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
                                    aria-label="Previous"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className={clampedPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            {pageCount > 5 && pageNumbers[0] > 1 && (
                                <>
                                    <PaginationItem>
                                        <PaginationLink onClick={() => setPage(1)} isActive={clampedPage === 1}>1</PaginationLink>
                                    </PaginationItem>
                                    {pageNumbers[0] > 2 && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}
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
                                    {lastPageNumber < pageCount - 1 && (
                                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                                    )}
                                    <PaginationItem>
                                        <PaginationLink onClick={() => setPage(pageCount)} isActive={clampedPage === pageCount}>
                                            {pageCount}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    aria-label="Next"
                                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                                    className={clampedPage === pageCount ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Showing {(clampedPage - 1) * HISTORY_PAGE_SIZE + 1}–
                        {Math.min(clampedPage * HISTORY_PAGE_SIZE, history.length)} of {history.length}.
                    </p>
                </td>
            </tr>
        </>
    );
}
