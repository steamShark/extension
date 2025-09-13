import { NotTrustItem } from "./interfaces";

export interface apiGetResponse{
    status: string;
    timestamp: string;
    data: NotTrustItem[];
}