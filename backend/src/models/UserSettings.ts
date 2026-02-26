import { pool } from '../config/database';

export interface IUserSettings {
  id: string;
  userId: string;
  notifications: {
    enabled: boolean;
    interventions: boolean;
    dailySummary: boolean;
  };
  flowDetection: {
    sensitivity: 'low' | 'medium' | 'high';
    minDuration: number;
  };
  interventionPreferences: {
    breathing: boolean;
    eyeRest: boolean;
    posture: boolean;
    hydration: boolean;
  };
  workSchedule: {
    startTime?: string;
    endTime?: string;
    workDays: number[];
  };
  distractionSites: string[];
  privacy: {
    localProcessing: boolean;
    shareAnalytics: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

class UserSettings {
  static async findOne(query: { userId?: string }): Promise<IUserSettings | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM user_settings WHERE user_id = $1', [query.userId]);
      if (result.rows.length === 0) return null;
      return this.mapRowToSettings(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async create(data: { userId?: string }): Promise<IUserSettings> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
        [data.userId]
      );
      return this.mapRowToSettings(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async findOneAndUpdate(
    query: { userId?: string },
    updates: any,
    options?: { new?: boolean; upsert?: boolean }
  ): Promise<IUserSettings | null> {
    const client = await pool.connect();
    try {
      // Check if exists
      const existing = await client.query('SELECT id FROM user_settings WHERE user_id = $1', [query.userId]);
      
      if (existing.rows.length === 0) {
        if (options?.upsert) {
          // Create new
          const result = await client.query(
            'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
            [query.userId]
          );
          return this.mapRowToSettings(result.rows[0]);
        }
        return null;
      }

      // Build update query
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      const flatUpdates = this.flattenUpdates(updates);
      Object.entries(flatUpdates).forEach(([key, value]) => {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      });

      if (fields.length === 0) return this.findOne(query);

      fields.push(`updated_at = NOW()`);
      values.push(query.userId);

      const updateQuery = `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${paramCount} RETURNING *`;
      const result = await client.query(updateQuery, values);
      
      return this.mapRowToSettings(result.rows[0]);
    } finally {
      client.release();
    }
  }

  private static flattenUpdates(updates: any): Record<string, any> {
    const flat: Record<string, any> = {};
    
    if (updates.notifications) {
      if (updates.notifications.enabled !== undefined) flat.notifications_enabled = updates.notifications.enabled;
      if (updates.notifications.interventions !== undefined) flat.notifications_interventions = updates.notifications.interventions;
      if (updates.notifications.dailySummary !== undefined) flat.notifications_daily_summary = updates.notifications.dailySummary;
    }
    
    if (updates.flowDetection) {
      if (updates.flowDetection.sensitivity !== undefined) flat.flow_detection_sensitivity = updates.flowDetection.sensitivity;
      if (updates.flowDetection.minDuration !== undefined) flat.flow_detection_min_duration = updates.flowDetection.minDuration;
    }
    
    if (updates.interventionPreferences) {
      if (updates.interventionPreferences.breathing !== undefined) flat.intervention_breathing = updates.interventionPreferences.breathing;
      if (updates.interventionPreferences.eyeRest !== undefined) flat.intervention_eye_rest = updates.interventionPreferences.eyeRest;
      if (updates.interventionPreferences.posture !== undefined) flat.intervention_posture = updates.interventionPreferences.posture;
      if (updates.interventionPreferences.hydration !== undefined) flat.intervention_hydration = updates.interventionPreferences.hydration;
    }
    
    if (updates.workSchedule) {
      if (updates.workSchedule.startTime !== undefined) flat.work_schedule_start_time = updates.workSchedule.startTime;
      if (updates.workSchedule.endTime !== undefined) flat.work_schedule_end_time = updates.workSchedule.endTime;
      if (updates.workSchedule.workDays !== undefined) flat.work_schedule_work_days = updates.workSchedule.workDays;
    }
    
    if (updates.distractionSites !== undefined) flat.distraction_sites = updates.distractionSites;
    
    if (updates.privacy) {
      if (updates.privacy.localProcessing !== undefined) flat.privacy_local_processing = updates.privacy.localProcessing;
      if (updates.privacy.shareAnalytics !== undefined) flat.privacy_share_analytics = updates.privacy.shareAnalytics;
    }
    
    return flat;
  }

  private static mapRowToSettings(row: any): IUserSettings {
    return {
      id: row.id,
      userId: row.user_id,
      notifications: {
        enabled: row.notifications_enabled,
        interventions: row.notifications_interventions,
        dailySummary: row.notifications_daily_summary,
      },
      flowDetection: {
        sensitivity: row.flow_detection_sensitivity,
        minDuration: row.flow_detection_min_duration,
      },
      interventionPreferences: {
        breathing: row.intervention_breathing,
        eyeRest: row.intervention_eye_rest,
        posture: row.intervention_posture,
        hydration: row.intervention_hydration,
      },
      workSchedule: {
        startTime: row.work_schedule_start_time,
        endTime: row.work_schedule_end_time,
        workDays: row.work_schedule_work_days,
      },
      distractionSites: row.distraction_sites || [],
      privacy: {
        localProcessing: row.privacy_local_processing,
        shareAnalytics: row.privacy_share_analytics,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default UserSettings;
