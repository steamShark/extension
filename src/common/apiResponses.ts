import { NotTrustedItem } from "./interfaces";

export interface apiGetResponse{
    status: string;
    timestamp: string;
    data: NotTrustedItem[];
}