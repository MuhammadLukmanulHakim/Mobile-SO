
export interface Location {
  id: number;
  name: string;
}

export interface InventoryItem {
  id: number;
  ref: string;
  name: string;
  defaultLoc: string;
  uBig: string;
  uSmall: string;
  initialQtyBig: number;
  initialQtySmall: number;
}

export interface OpnameResult {
  id: number;
  location: string;
  itemName: string;
  ref: string;
  qtyBig: number;
  qtySmall: number;
  uBig: string;
  uSmall: string;
}

export interface ExportedReport {
  id: number;
  filename: string;
  timestamp: string;
  dataSnapshot: OpnameResult[];
}

export enum AppTab {
  LOKASI = 'LOKASI',
  BARANG = 'BARANG',
  OPNAME = 'OPNAME'
}
