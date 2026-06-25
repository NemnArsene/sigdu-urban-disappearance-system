import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});


export const reportIncidentSchema = z.object({
  type: z.enum(['DISPARITION', 'ENLEVEMENT', 'RETROUVE']),
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères").max(100, "Le titre est trop long"),
  description: z.string().min(20, "Veuillez fournir plus de détails (au moins 20 caractères)"),
  lat: z.number({ required_error: "La latitude est requise" }).min(-90).max(90),
  lng: z.number({ required_error: "La longitude est requise" }).min(-180).max(180),
  address: z.string().optional(),
  arrondissement: z.string().min(1, "Veuillez sélectionner un arrondissement"),
  photos: z.array(z.string()).max(5, "Maximum 5 photos"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ReportIncidentFormValues = z.infer<typeof reportIncidentSchema>;
