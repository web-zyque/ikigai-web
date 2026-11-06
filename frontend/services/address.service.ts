import api from "@/api/axios";
import type { Address, AddressInput } from "@/types/address.types";

interface AddressResponse {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: "Home" | "Work";
  isDefault: boolean;
}

const toAddress = (address: AddressResponse): Address => ({
  id: address.id,
  name: address.fullName,
  phone: address.phone,
  type: address.addressType,
  addressLine: address.addressLine1,
  addressLine2: address.addressLine2 ?? undefined,
  landmark: address.landmark ?? undefined,
  city: address.city,
  state: address.state,
  pincode: address.postalCode,
  country: address.country,
  isDefault: address.isDefault,
});

const toPayload = (address: AddressInput) => ({
  fullName: address.name,
  phone: address.phone,
  addressLine1: address.addressLine,
  addressLine2: address.addressLine2 || null,
  landmark: address.landmark || null,
  city: address.city,
  state: address.state,
  postalCode: address.pincode,
  country: address.country || "India",
  addressType: address.type,
  isDefault: address.isDefault,
});

export const addressService = {
  async getAll(): Promise<Address[]> {
    const { data } = await api.get<AddressResponse[]>("/addresses");
    return data.map(toAddress);
  },
  async getById(id: string): Promise<Address> {
    const { data } = await api.get<AddressResponse>(`/addresses/${id}`);
    return toAddress(data);
  },
  async create(input: AddressInput): Promise<Address> {
    const { data } = await api.post<AddressResponse>("/addresses", toPayload(input));
    return toAddress(data);
  },
  async update(id: string, input: AddressInput): Promise<Address> {
    const { data } = await api.patch<AddressResponse>(`/addresses/${id}`, toPayload(input));
    return toAddress(data);
  },
  async remove(id: string): Promise<Address[]> {
    const { data } = await api.delete<{ addresses: AddressResponse[] }>(`/addresses/${id}`);
    return data.addresses.map(toAddress);
  },
  async setDefault(id: string): Promise<Address[]> {
    const { data } = await api.patch<{ addresses: AddressResponse[] }>(`/addresses/${id}/default`);
    return data.addresses.map(toAddress);
  },
};
