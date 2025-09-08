// ResetConfirm.tsx
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";

type Props = {
    onConfirm: () => void;
};

/* 
Component responsible to reset settings
*/
export function ResetSettingsConfirm({ onConfirm }: Props) {
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
                    <RotateCcw size={18} />
                    <span>Reset to Defaults</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reset settings?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will restore all options to their default values. You can’t undo this action.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:bg-muted-foreground cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/50 cursor-pointer" onClick={handleConfirm}>
                        Yes, reset
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
