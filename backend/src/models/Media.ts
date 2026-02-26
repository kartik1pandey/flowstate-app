import { pool } from '../config/database';

export interface IMedia {
  id: string;
  userId: string;
  sessionId?: string;
  type: 'snapshot' | 'audio' | 'video' | 'document';
  s3Key: string;
  s3Url: string;
  filename: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

class Media {
  static async find(query: any): Promise<any> {
    const client = await pool.connect();
    try {
      let sqlQuery = 'SELECT * FROM media WHERE user_id = $1';
      const params: any[] = [query.userId];
      
      if (query.sessionId) {
        sqlQuery += ' AND session_id = $2';
        params.push(query.sessionId);
      }
      
      sqlQuery += ' ORDER BY created_at DESC';
      
      const result = await client.query(sqlQuery, params);
      return {
        sort: () => ({ limit: (n: number) => ({ lean: () => result.rows.map(this.mapRowToMedia) }) }),
        lean: () => result.rows.map(this.mapRowToMedia),
      };
    } finally {
      client.release();
    }
  }

  static async create(data: any): Promise<IMedia> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO media (
          user_id, session_id, type, s3_key, s3_url, filename, mime_type, size, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          data.userId,
          data.sessionId || null,
          data.type,
          data.s3Key,
          data.s3Url,
          data.filename,
          data.mimeType,
          data.size,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ]
      );
      
      return this.mapRowToMedia(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<IMedia | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM media WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return this.mapRowToMedia(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async findOneAndDelete(query: any): Promise<IMedia | null> {
    const client = await pool.connect();
    try {
      const id = query._id || query.id;
      const result = await client.query(
        'DELETE FROM media WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, query.userId]
      );
      
      if (result.rows.length === 0) return null;
      return this.mapRowToMedia(result.rows[0]);
    } finally {
      client.release();
    }
  }

  private static mapRowToMedia(row: any): IMedia {
    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      type: row.type,
      s3Key: row.s3_key,
      s3Url: row.s3_url,
      filename: row.filename,
      mimeType: row.mime_type,
      size: parseInt(row.size),
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Media;
