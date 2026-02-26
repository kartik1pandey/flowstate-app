import { pool } from '../config/database';

export interface IFlowSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  qualityScore: number;
  focusScore: number;
  triggers: string[];
  breakers: string[];
  metrics: {
    avgTypingSpeed: number;
    tabSwitches: number;
    mouseActivity: number;
    fatigueLevel: number;
  };
  language?: string;
  distractions: number;
  sessionType?: string;
  codeMetrics?: {
    linesOfCode: number;
    charactersTyped: number;
    complexityScore: number;
    errorsFixed: number;
  };
  whiteboardMetrics?: {
    totalStrokes: number;
    shapesDrawn: number;
    colorsUsed: number;
    canvasCoverage: number;
    eraserUses: number;
    toolSwitches: number;
    averageStrokeSpeed: number;
    creativityScore: number;
  };
  interventions: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

class FlowSession {
  static async find(query: any): Promise<IFlowSession[]> {
    const client = await pool.connect();
    try {
      let sqlQuery = 'SELECT * FROM flow_sessions WHERE user_id = $1';
      const params: any[] = [query.userId];
      
      if (query.startTime) {
        sqlQuery += ' AND start_time >= $2 AND start_time <= $3';
        params.push(query.startTime.$gte, query.startTime.$lte);
      }
      
      sqlQuery += ' ORDER BY start_time DESC';
      
      const result = await client.query(sqlQuery, params);
      return result.rows.map(this.mapRowToSession);
    } finally {
      client.release();
    }
  }

  static async findOne(query: { _id?: string; id?: string; userId?: string }): Promise<IFlowSession | null> {
    const client = await pool.connect();
    try {
      const id = query._id || query.id;
      const result = await client.query(
        'SELECT * FROM flow_sessions WHERE id = $1 AND user_id = $2',
        [id, query.userId]
      );
      
      if (result.rows.length === 0) return null;
      return this.mapRowToSession(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async create(data: any): Promise<IFlowSession> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO flow_sessions (
          user_id, start_time, end_time, duration, quality_score, focus_score,
          triggers, breakers, metrics_avg_typing_speed, metrics_tab_switches,
          metrics_mouse_activity, metrics_fatigue_level, language, distractions,
          session_type, code_metrics_lines_of_code, code_metrics_characters_typed,
          code_metrics_complexity_score, code_metrics_errors_fixed,
          whiteboard_metrics_total_strokes, whiteboard_metrics_shapes_drawn,
          whiteboard_metrics_colors_used, whiteboard_metrics_canvas_coverage,
          whiteboard_metrics_eraser_uses, whiteboard_metrics_tool_switches,
          whiteboard_metrics_average_stroke_speed, whiteboard_metrics_creativity_score,
          interventions, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        ) RETURNING *`,
        [
          data.userId,
          data.startTime,
          data.endTime || null,
          data.duration || 0,
          data.qualityScore || 0,
          data.focusScore || 0,
          data.triggers || [],
          data.breakers || [],
          data.metrics?.avgTypingSpeed || 0,
          data.metrics?.tabSwitches || 0,
          data.metrics?.mouseActivity || 0,
          data.metrics?.fatigueLevel || 0,
          data.language || 'javascript',
          data.distractions || 0,
          data.sessionType || 'other',
          data.codeMetrics?.linesOfCode || 0,
          data.codeMetrics?.charactersTyped || 0,
          data.codeMetrics?.complexityScore || 0,
          data.codeMetrics?.errorsFixed || 0,
          data.whiteboardMetrics?.totalStrokes || 0,
          data.whiteboardMetrics?.shapesDrawn || 0,
          data.whiteboardMetrics?.colorsUsed || 0,
          data.whiteboardMetrics?.canvasCoverage || 0,
          data.whiteboardMetrics?.eraserUses || 0,
          data.whiteboardMetrics?.toolSwitches || 0,
          data.whiteboardMetrics?.averageStrokeSpeed || 0,
          data.whiteboardMetrics?.creativityScore || 0,
          data.interventions || [],
          data.notes || null,
        ]
      );
      
      return this.mapRowToSession(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async findOneAndUpdate(query: any, updates: any, options?: any): Promise<IFlowSession | null> {
    const client = await pool.connect();
    try {
      const id = query._id || query.id;
      const setUpdates = updates.$set || updates;
      
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(setUpdates).forEach(([key, value]) => {
        const snakeKey = this.camelToSnake(key);
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      });

      if (fields.length === 0) return this.findOne({ id, userId: query.userId });

      fields.push(`updated_at = NOW()`);
      values.push(id, query.userId);

      const updateQuery = `UPDATE flow_sessions SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;
      const result = await client.query(updateQuery, values);
      
      if (result.rows.length === 0) return null;
      return this.mapRowToSession(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async findOneAndDelete(query: any): Promise<IFlowSession | null> {
    const client = await pool.connect();
    try {
      const id = query._id || query.id;
      const result = await client.query(
        'DELETE FROM flow_sessions WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, query.userId]
      );
      
      if (result.rows.length === 0) return null;
      return this.mapRowToSession(result.rows[0]);
    } finally {
      client.release();
    }
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private static mapRowToSession(row: any): IFlowSession {
    return {
      id: row.id,
      userId: row.user_id,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration,
      qualityScore: row.quality_score,
      focusScore: row.focus_score,
      triggers: row.triggers || [],
      breakers: row.breakers || [],
      metrics: {
        avgTypingSpeed: parseFloat(row.metrics_avg_typing_speed) || 0,
        tabSwitches: row.metrics_tab_switches || 0,
        mouseActivity: parseFloat(row.metrics_mouse_activity) || 0,
        fatigueLevel: parseFloat(row.metrics_fatigue_level) || 0,
      },
      language: row.language,
      distractions: row.distractions,
      sessionType: row.session_type,
      codeMetrics: {
        linesOfCode: row.code_metrics_lines_of_code || 0,
        charactersTyped: row.code_metrics_characters_typed || 0,
        complexityScore: parseFloat(row.code_metrics_complexity_score) || 0,
        errorsFixed: row.code_metrics_errors_fixed || 0,
      },
      whiteboardMetrics: row.whiteboard_metrics_total_strokes ? {
        totalStrokes: row.whiteboard_metrics_total_strokes || 0,
        shapesDrawn: row.whiteboard_metrics_shapes_drawn || 0,
        colorsUsed: row.whiteboard_metrics_colors_used || 0,
        canvasCoverage: parseFloat(row.whiteboard_metrics_canvas_coverage) || 0,
        eraserUses: row.whiteboard_metrics_eraser_uses || 0,
        toolSwitches: row.whiteboard_metrics_tool_switches || 0,
        averageStrokeSpeed: parseFloat(row.whiteboard_metrics_average_stroke_speed) || 0,
        creativityScore: parseFloat(row.whiteboard_metrics_creativity_score) || 0,
      } : undefined,
      interventions: row.interventions || [],
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default FlowSession;
