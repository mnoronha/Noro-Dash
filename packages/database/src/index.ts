export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Agency {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface Account {
  id: string;
  agency_id: string;
  name: string;
  slug: string;
  website_url: string | null;
  status: string;
}
