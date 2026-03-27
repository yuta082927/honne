"use client";

import { useState } from "react";
import type { UserGender } from "@/lib/constants";

export type BirthFormData = {
  selfBirthDate: string;
  selfBirthTime: string;
  selfBirthPlace: string;
  partnerBirthDate: string;
  partnerBirthTime: string;
  partnerBirthPlace: string;
  gender: UserGender | "";
};

export function useBirthForm() {
  const [selfBirthDate, setSelfBirthDate] = useState("");
  const [selfBirthTime, setSelfBirthTime] = useState("");
  const [selfBirthPlace, setSelfBirthPlace] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [partnerBirthTime, setPartnerBirthTime] = useState("");
  const [partnerBirthPlace, setPartnerBirthPlace] = useState("");
  const [gender, setGender] = useState<UserGender | "">("");
  const [isBirthFormOpen, setIsBirthFormOpen] = useState(true);

  const data: BirthFormData = {
    selfBirthDate,
    selfBirthTime,
    selfBirthPlace,
    partnerBirthDate,
    partnerBirthTime,
    partnerBirthPlace,
    gender
  };

  return {
    data,
    isBirthFormOpen,
    setIsBirthFormOpen,
    setSelfBirthDate,
    setSelfBirthTime,
    setSelfBirthPlace,
    setPartnerBirthDate,
    setPartnerBirthTime,
    setPartnerBirthPlace,
    setGender
  };
}
