import { Request, Response } from 'express';
import pool from '../config/database';

class HealthController {
  /**
   * Checks the status of the server and its database connection.
   */
  public check = async (req: Request, res: Response) => {
    // 1. Check database connectivity by running a simple query
    const dbResult = await pool.query('SELECT NOW() as db_time');
    const dbStatus = {
      status: 'ok',
      timestamp: dbResult.rows[0].db_time,
    };

    // 2. Log to console for easy debugging during development
    console.log('🩺 Health Check successful:');
    console.table({
      server: { status: 'ok', timestamp: new Date().toISOString() },
      database: dbStatus,
    });

    // 3. Send a comprehensive JSON response
    res.status(200).json({
      server: { status: 'ok' },
      database: { status: 'ok' },
    });
  };
}

export const healthController = new HealthController();

