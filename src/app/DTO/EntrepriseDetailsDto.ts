import { FournisseurLightDto } from "./FournisseurLightDto";

export interface EntrepriseDetailsDto {
    id: number;
    nom: string;
    adresse: string;
    email: string;
    tel: string;
    fournisseurs: FournisseurLightDto[];
    retenuesCount: number;
    totalRetenueAmount: number;
    traitesCount: number;
    totalTraiteAmount: number;
    articlesCount: number;
    banquesCount: number;
    mostUsedFournisseur: FournisseurLightDto | null;
    mostUsedBanque: string | null;
} 