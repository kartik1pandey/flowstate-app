import { pool } from '../config/database';

export interface IUser {
  id: string;
  email: string;
  name: string;
  password: string;
  image?: string;
  age?: number;
  dateOfBirth?: Date;
  gender?: string;
  phoneNumber?: string;
  occupation?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  yearsOfExperience?: number;
  educationLevel?: string;
  fieldOfStudy?: string;
  institution?: string;
  primaryGoals?: string[];
  focusAreas?: string[];
  hobbies?: string[];
  learningInterests?: string[];
  preferredWorkingHours?: string;
  workEnvironment?: string;
  productivityChallenges?: string[];
  timezone?: string;
  country?: string;
  city?: string;
  bio?: string;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class User {
  static async findOne(query: { email?: string; id?: string }): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      let result;
      if (query.email) {
        result = await client.query('SELECT * FROM users WHERE email = $1', [query.email]);
      } else if (query.id) {
        result = await client.query('SELECT * FROM users WHERE id = $1', [query.id]);
      }
      
      if (!result || result.rows.length === 0) return null;
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async findById(id: string): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async create(userData: Partial<IUser>): Promise<IUser> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (email, name, password) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userData.email, userData.name, userData.password]
      );
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  static async findByIdAndUpdate(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(updates).forEach(([key, value]) => {
        const snakeKey = this.camelToSnake(key);
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      });

      if (fields.length === 0) return this.findById(id);

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) return null;
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private static mapRowToUser(row: any): IUser {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      image: row.image,
      age: row.age,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      phoneNumber: row.phone_number,
      occupation: row.occupation,
      company: row.company,
      jobTitle: row.job_title,
      industry: row.industry,
      yearsOfExperience: row.years_of_experience,
      educationLevel: row.education_level,
      fieldOfStudy: row.field_of_study,
      institution: row.institution,
      primaryGoals: row.primary_goals,
      focusAreas: row.focus_areas,
      hobbies: row.hobbies,
      learningInterests: row.learning_interests,
      preferredWorkingHours: row.preferred_working_hours,
      workEnvironment: row.work_environment,
      productivityChallenges: row.productivity_challenges,
      timezone: row.timezone,
      country: row.country,
      city: row.city,
      bio: row.bio,
      spotifyAccessToken: row.spotify_access_token,
      spotifyRefreshToken: row.spotify_refresh_token,
      spotifyTokenExpiry: row.spotify_token_expiry,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default User;
