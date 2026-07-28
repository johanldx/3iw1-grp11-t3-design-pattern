import { HttpClient } from './http-client.ts';

type FuelFieldKey = 'gazole' | 'sp95' | 'e10' | 'sp98' | 'e85' | 'gplc';

interface FuelApiRecord {
  id: string | number;
  adresse?: string;
  ville?: string;
  cp?: string;
  gazole_prix?: number | null;
  gazole_maj?: string | null;
  sp95_prix?: number | null;
  sp95_maj?: string | null;
  e10_prix?: number | null;
  e10_maj?: string | null;
  sp98_prix?: number | null;
  sp98_maj?: string | null;
  e85_prix?: number | null;
  e85_maj?: string | null;
  gplc_prix?: number | null;
  gplc_maj?: string | null;
}

interface FuelApiResponse {
  results: FuelApiRecord[];
}

const fuelFieldMap: Record<string, FuelFieldKey> = {
  Gazole: 'gazole',
  SP95: 'sp95',
  E10: 'e10',
  SP98: 'sp98',
  E85: 'e85',
  GPLc: 'gplc',
};

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
  private readonly client: HttpClient;

  /**
   * Initialise le service d'accès au dataset officiel des carburants.
   *
   * @param client Client HTTP injectable pour les tests.
   */
  constructor(
    client: HttpClient = new HttpClient(
      'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets',
    ),
  ) {
    this.client = client;
  }

  /**
   * Recherche les prix d'un carburant pour un code postal donné.
   *
   * @param postalCode Code postal de recherche.
   * @param fuel Type de carburant recherché.
   * @returns Liste normalisée des stations trouvées.
   */
  async search(postalCode: string, fuel = 'Gazole'): Promise<FuelPrice[]> {
    const fuelField = fuelFieldMap[fuel];

    if (!fuelField) {
      throw new Error(`Carburant non supporté : ${fuel}.`);
    }

    const priceField = `${fuelField}_prix`;
    const updatedAtField = `${fuelField}_maj`;
    const query = new URLSearchParams({
      limit: '20',
      select: `id,adresse,ville,cp,${priceField},${updatedAtField}`,
      where: `cp="${postalCode}" AND ${priceField} is not null`,
      order_by: `${priceField} asc`,
    });
    const response = await this.client.get<FuelApiResponse>(
      `/prix-des-carburants-en-france-flux-instantane-v2/records?${query.toString()}`,
    );

    return response.results.map((record) => ({
      stationId: String(record.id),
      address: record.adresse ?? '',
      city: record.ville ?? '',
      postalCode: record.cp ?? '',
      fuel,
      price: record[priceField as keyof FuelApiRecord] as number | null | undefined ?? null,
      updatedAt: record[updatedAtField as keyof FuelApiRecord] as string | null | undefined ?? null,
    }));
  }
}
