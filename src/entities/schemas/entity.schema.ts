// src/entities/schemas/entity.schema.ts

export interface Entity {
  id: string;          // PK en Dynamo
  _id: string;         // alias para mantener compatibilidad con el frontend
  name: string;
  description?: string;
  path: string;        // slug único a nivel de app
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
}
