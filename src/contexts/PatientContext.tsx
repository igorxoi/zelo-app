import { createContext, ReactNode, useContext, useState } from "react";

type PatientContextValue = {
  patientId: string;
  setPatientId: (id: string) => void;
};

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patientId, setPatientId] = useState("1");

  return (
    <PatientContext.Provider value={{ patientId, setPatientId }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context)
    throw new Error("usePatient deve ser usado dentro de PatientProvider");
  return context;
}
