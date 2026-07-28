import { HttpClient } from './http-client.ts';

interface FuelApiRecord {
  id: string;
  adresse?: string;
  ville?: string;
  cp?: string;
  prix_nom?: string;
  prix_valeur?: number;
  prix_maj?: string;
}

interface FuelApiResponse {
  results: FuelApiRecord[];
}

/** Prix carburant normalisé pour l'application. */
export interface FuelPrice {
  stationId: string;
  address: string;
  city: string;
  postalCode: string;
  fuel: string;
  price: number | null;
  updatedAt: string | null;
}

/** Accès typé au flux officiel des prix des carburants. */
export class FuelPriceService {
  private readonly client = new HttpClient('https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets');

  async search(postalCode: string, fuel = 'Gazole'): Promise<FuelPrice[]> {
    const query = new URLSearchParams({
      limit: '20',
      where: `cp="${postalCode}" AND prix_nom="${fuel}"`,
    });
    const response = await this.client.get<FuelApiResponse>(
      `/prix-des-carburants-en-france-flux-instantane-v2/records?${query.toString()}`,
    );
    return response.results.map((record) => ({
      stationId: record.id,
      address: record.adresse ?? '',
      city: record.ville ?? '',
      postalCode: record.cp ?? '',
      fuel: record.prix_nom ?? fuel,
      price: record.prix_valeur ?? null,
      updatedAt: record.prix_maj ?? null,
    }));
  }
}
