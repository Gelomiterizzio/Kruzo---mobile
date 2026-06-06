import { z } from 'zod'

const bolivianPhone = z
  .string()
  .regex(/^(\+591|591|0)?[67]\d{7}$/, 'Ingresa un número boliviano válido (ej: 70000000)')
  .transform((v) => v.replace(/\D/g, ''))

export const businessSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  tagline: z.string().max(120, 'Máximo 120 caracteres').optional().default(''),
  description: z.string().min(10, 'Describe tu negocio (mín. 10 caracteres)').max(1000),
  category: z.array(z.string()).min(1, 'Selecciona al menos una categoría').max(3),
  subcategory: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  whatsapp: bolivianPhone,
  phone: z.string().optional().default(''),
  email: z.string().email('Email inválido').optional().or(z.literal('')).default(''),
  instagram: z.string().optional().default(''),
  facebook: z.string().optional().default(''),
  tiktok: z.string().optional().default(''),
  website: z.string().url('URL inválida').optional().or(z.literal('')).default(''),
  address: z.string().min(5, 'Ingresa la dirección').max(200),
  zone: z.string().min(1, 'Selecciona la zona'),
  hasDelivery: z.boolean().default(false),
  hasOnlinePayment: z.boolean().default(false),
  acceptsQR: z.boolean().default(false),
})

export const postSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  description: z.string().min(10).max(800),
  price: z.number().min(0, 'Precio inválido').max(1_000_000),
  priceType: z.enum(['fixed', 'negotiable', 'free', 'consult']),
  originalPrice: z.number().optional(),
  category: z.string().min(1, 'Selecciona una categoría'),
  subcategory: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  inStock: z.boolean().default(true),
  stockCount: z.number().optional(),
  hasDelivery: z.boolean().default(false),
  deliveryZones: z.string().optional().default(''),
  deliveryPrice: z.number().min(0).default(0),
  whatsappMessage: z.string().max(200).optional().default(''),
})

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Selecciona una calificación').max(5),
  comment: z.string().min(10, 'Mínimo 10 caracteres').max(500, 'Máximo 500 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type BusinessFormValues = z.infer<typeof businessSchema>
export type PostFormValues = z.infer<typeof postSchema>
export type ReviewFormValues = z.infer<typeof reviewSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
