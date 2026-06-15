import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShippingAddressPayload } from '../../shared/api/types';

export const SHIPPING_ADDRESS_STORAGE_KEY = '@pullhub_shipping_address_v1';

export async function loadShippingAddress(): Promise<ShippingAddressPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(SHIPPING_ADDRESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ShippingAddressPayload>;
    if (
      !parsed.fullName?.trim() ||
      !parsed.line1?.trim() ||
      !parsed.city?.trim() ||
      !parsed.country?.trim()
    ) {
      return null;
    }
    return {
      fullName: parsed.fullName.trim(),
      line1: parsed.line1.trim(),
      line2: parsed.line2?.trim() || undefined,
      city: parsed.city.trim(),
      region: parsed.region?.trim() || undefined,
      postal: parsed.postal?.trim() || undefined,
      country: parsed.country.trim(),
    };
  } catch {
    return null;
  }
}
