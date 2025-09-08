import { AlertTriangle, Shield } from "lucide-react";
import { Badge } from "../components/ui/badge";

export const getCategoryBadge = (category: string) => {
    const variants = {
        trusted: 'success',
        malicious: 'destructive',
        trading: 'primary',
        tools: 'accent'
    };
    return variants[category as keyof typeof variants] || 'default';
};

export const getStatusIcon = (status: string) => {
    return status === 'safe' ? (
        <Shield className="w-4 h-4 text-success" />
    ) : (
        <AlertTriangle className="w-4 h-4 text-destructive" />
    );
};

export const getStatusBadge = (status: string) => {
    return status === 'safe' ? (
        <Badge variant="default">Safe</Badge>
    ) : (
        <Badge variant="destructive">Blocked</Badge>
    );
};