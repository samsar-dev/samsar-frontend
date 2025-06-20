export interface LocationData {
  address: string;
  coordinates?: [number, number];
  boundingBox?: [number, number, number, number];
  rawResult?: {
    place_id?: string | number;
    display_name?: string;
    lat?: string;
    lon?: string;
    boundingbox?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}
