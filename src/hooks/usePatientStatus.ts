import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { usePatient } from "@/contexts/PatientContext";
import { getPatients } from "@/services/patients";

type Status = "loading" | "none" | "ready" | "error";

export function usePatientStatus() {
  const { patientId, setPatientId } = usePatient();

  const [status, setStatus] = useState<Status>("loading");
  const [validatedId, setValidatedId] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;

      const check = async () => {
        try {
          const patients = await getPatients();
          if (!isCurrent) return;

          if (patients.length === 0) {
            setPatientId("");
            setValidatedId("");
            setStatus("none");
            return;
          }

          const selected = patients.some((patient) => patient.id === patientId)
            ? patientId
            : patients[0].id;

          if (selected !== patientId) setPatientId(selected);
          setValidatedId(selected);
          setStatus("ready");
        } catch {
          if (isCurrent)
            setStatus((current) => (current === "ready" ? current : "error"));
        }
      };

      check();

      return () => {
        isCurrent = false;
      };
    }, [patientId, setPatientId]),
  );

  const ready = status === "ready" && validatedId === patientId;

  return { status, ready };
}
