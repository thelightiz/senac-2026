export interface Document {
  id: number;
  name?: string;
}

export interface NewData {
  id: number;
  salary: number;
  residence_address: string;
  residence_zip_code: string;
  properties?: Property[];
  vehicles?: Vehicle[];
}

export interface NewDataState {
  salary: string;
  residence_address: string;
  residence_zip_code: string;
  properties?: Property[];
  vehicles?: Vehicle[];
}

export interface OldData {
  id: number;
  salary_snapshot: number;
  address_snapshot: string;
  zip_code_snapshot: string;
  has_property_snapshot: boolean;
  has_vehicle_snapshot: boolean;
  properties_snapshot: Property[];
  vehicles_snapshot: Vehicle[];
}

export interface Property {
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  zip_code: string | null;
}

export interface UpdateRequest {
  id: number;
  created_by: string;
  customer: string;
  update_type: string;
  status: string;
  old_data: OldData[] | null;
  new_data: NewData[] | null;
  documents: Document[] | null;
}

export interface Vehicle {
  renavam: string | null;
  plate: string | null;
  brand_model: string | null;
  year: string | null;
}
