import { request } from "@/services/api";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleLabel: string;
  isMaster: boolean;
};

export function getUserProfile(): Promise<UserProfile> {
  return request<UserProfile>("GET", "/profile");
}

export type PatientProfile = {
  id: string;
  name: string;
  nickname: string;
  age: number;
  caregivers: { id: string; name: string; phone: string }[];
};

export function getPatientProfile(
  _patientId?: string,
): Promise<PatientProfile> {
  return request<PatientProfile>("GET", "/patient/profile");
}
