export interface apiGetResponse {
  status: string;
  timestamp: string;
  message: string;
  data: {
    data: Array<{
      url: string;
      description: string;
      [key: string]: unknown; // other fields you don't need
    }>;
  };
  metadata: {
    page: number;
    page_size: number;
    total: number;
  };
}