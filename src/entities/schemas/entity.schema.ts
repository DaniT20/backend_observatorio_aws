/* // src/entities/schemas/entity.schema.ts

export interface Entity {
  id: string;          // PK en Dynamo
  _id: string;         // alias para mantener compatibilidad con el frontend
  name: string;
  description?: string;
  path: string;        // slug único a nivel de app
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
}
 */

export interface EntityColumn {
  name: string;        // nombre exacto de la columna en el CSV
  position: number;    // índice esperado (0,1,2...)
}

export interface Entity {
  id: string;
  _id: string;
  name: string;
  description?: string;
  path: string;

  // 👇 Nuevo campo
  columns: EntityColumn[];

  createdAt: string;
  updatedAt: string;
}