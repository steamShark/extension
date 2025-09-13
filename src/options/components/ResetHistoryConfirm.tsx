// ResetConfirm.tsx
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
    onConfirm: () => void;
};

/* 
Component responsible to reset settings
*/
export function ResetHistoryConfirm({ onConfirm }: Props) {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();           // reset local state
        // (optional) persist immediately:
        // chrome.storage.local.set({ settings: JSON.stringify({ data: defaultSettings }) });
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    className="flex items-center space-x-2 cursor-pointer"
                >
                    <Trash2 size={18} />
                    <span>Remove</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove History?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove all registered history in local storage.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:bg-muted-foreground cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/50 cursor-pointer" onClick={handleConfirm}>
                        Yes, remove
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
