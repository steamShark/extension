import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Loader2 } from "lucide-react";

type Props = {
    onRetry: () => Promise<void> | void;
    showLoading?: boolean;       // set true while you're fetching
};

export function HistoryLoading() {
    return (
        <div className="min-h-[40vh] flex items-center justify-center p-6">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Loading History...</CardTitle>
                    <CardDescription>Fetching from Chrome storage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export function HistoryErrorState({ onRetry, showLoading }: Props) {
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        try {
            setRetrying(true);
            await onRetry();
        } finally {
            setRetrying(false);
        }
    };

    if (showLoading) return <HistoryLoading />;

    return (
        <div className="min-h-[40vh] flex items-center justify-center p-6">
            <Card className="w-full max-w-lg">
                <CardHeader className="flex flex-row items-start gap-3">
                    <div className="rounded-full bg-destructive/10 p-2 mt-1">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                        <CardTitle>Couldn’t load your history</CardTitle>
                        <CardDescription>
                            We couldn’t read data from Chrome local storage. This can happen right after install or if storage was cleared.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>Try again or open the extension settings to configure things manually.</p>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2">
                    <Button onClick={handleRetry} disabled={retrying} className="cursor-pointer">
                        {retrying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Try again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
