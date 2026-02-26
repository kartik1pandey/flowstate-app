import { pool } from '../config/database';

export interface IIntervention {
  id: string;
  userId: string;
  sessionId?: string;
  type: 'breathing' | 'eye-rest' | 'posture' | 'hydration' | 'break';
  timestamp: Date;
  duration: number;
  completed: boolean;
  effectiveness?: number;
  createdAt: Date;
  updatedAt: Date;
}

class Intervention {
  static async find(query: any): Promise<IIntervention[]> {
    const client = await pool.connect();
    try {
      let sqlQuery = 'SELECT * FROM interventions WHERE user_id = $1';
      const params: any[] = [query.userId];
      
      if (query.sessionId) {
        sqlQuery += ' AND session_id = $2';
        params.push(query.sessionId);
      }
      
      sqlQuery += ' ORDER BY timestamp DESC';
      
      const result = await client.query(sqlQuery, params);
      return result.rows.map(this.mapRowToIntervention);
    } finally {
      client.release();
    }
  }

  static async create(data: any): Promise<IIntervention> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO interventions (
          user_id, session_id, type, timestamp, duration, completed, effectiveness
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          data.userId,
          data.sessionId || null,
          data.type,
          data.timestamp || new Date(),
          data.duration || 60,
          data.completed || false,
          data.effectiveness || null,
        ]
      );
      
      return this.mapRowToIntervention(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async findOneAndUpdate(query: any, updates: any, options?: any): Promise<IIntervention | null> {
    const client = await pool.connect();
    try {
      const id = query._id || query.id;
      const setUpdates = updates.$set || updates;
      
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (setUpdates.completed !== undefined) {
        fields.push(`completed = $${paramCount}`);
        values.push(setUpdates.completed);
        paramCount++;
      }
      
      if (setUpdates.effectiveness !== undefined) {
        fields.push(`effectiveness = $${paramCount}`);
        values.push(setUpdates.effectiveness);
        paramCount++;
      }

      if (fields.length === 0) return null;

      fields.push(`updated_at = NOW()`);
      values.push(id, query.userId);

      const updateQuery = `UPDATE interventions SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;
      const result = await client.query(updateQuery, values);
      
      if (result.rows.length === 0) return null;
      return this.mapRowToIntervention(result.rows[0]);
    } finally {
      client.release();
    }
  }

  private static mapRowToIntervention(row: any): IIntervention {
    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      type: row.type,
      timestamp: row.timestamp,
      duration: row.duration,
      completed: row.completed,
      effectiveness: row.effectiveness,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Intervention;
