export interface StoredLocation {
  device_id: string;
  label: string;
  latitude: number;
  longitude: number;
  timezone: string | null;
  updated_at: string;
}

export interface ClothingLogRow {
  id: string;
  device_id: string;
  log_date: string;
  temperature: number;
  weather_code: number;
  precipitation_prob: number | null;
  suggested_category: string;
  actual_worn: string;
  confirmed_suggestion: boolean;
  created_at: string;
}
