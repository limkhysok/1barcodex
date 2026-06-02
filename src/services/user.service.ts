import api from "./api";
import { User } from "../types/auth.types";

const BASE_URL = "/v1/admin/staff";

export const getStaffUsers = async (): Promise<User[]> => {
  const { data } = await api.get<{ results: User[] } | User[]>(`${BASE_URL}/`);
  if (Array.isArray(data)) return data;
  return data.results ?? [];
};

export const createStaffUser = async (userData: Partial<User>): Promise<User> => {
  const { data } = await api.post<User>("/v1/admin/staff/", userData);
  return data;
};

export const updateStaffUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const { data } = await api.patch<User>(`${BASE_URL}/${id}/`, userData);
  return data;
};

export const deleteStaffUser = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}/`);
};

