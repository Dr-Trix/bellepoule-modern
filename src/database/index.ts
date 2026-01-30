/**
 * BellePoule Modern - Database Layer
 * Portable SQLite database for competition data
 * Licensed under GPL-3.0
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  Competition,
  Fencer,
  FencerStatus,
  Gender,
  Weapon,
  Category,
  Referee,
  Pool,
  Match,
  MatchStatus,
} from '../shared/types';

export class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'bellepoule.db');
  }

  public open(dbPath?: string): void {
    if (dbPath) this.dbPath = dbPath;
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.initializeTables();
  }

  public close(): void {
    if (this.db) { this.db.close(); this.db = null; }
  }

  public getPath(): string { return this.dbPath; }
  public isOpen(): boolean { return this.db !== null; }

  private initializeTables(): void {
    if (!this.db) throw new Error('Database not open');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS competitions (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, short_title TEXT,
        date TEXT NOT NULL, location TEXT, organizer TEXT,
        weapon TEXT NOT NULL, gender TEXT NOT NULL, category TEXT NOT NULL,
        championship TEXT, color TEXT DEFAULT '#3B82F6',
        current_phase_index INTEGER DEFAULT 0, is_team_event INTEGER DEFAULT 0,
        status TEXT DEFAULT 'draft', settings TEXT,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fencers (
        id TEXT PRIMARY KEY, competition_id TEXT NOT NULL,
        ref INTEGER NOT NULL, last_name TEXT NOT NULL, first_name TEXT NOT NULL,
        birth_date TEXT, gender TEXT NOT NULL, nationality TEXT DEFAULT 'FRA',
        league TEXT, club TEXT, license TEXT, ranking INTEGER,
        status TEXT DEFAULT 'N', seed_number INTEGER, final_ranking INTEGER,
        pool_stats TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS referees (
        id TEXT PRIMARY KEY, competition_id TEXT NOT NULL,
        ref INTEGER NOT NULL, last_name TEXT NOT NULL, first_name TEXT NOT NULL,
        gender TEXT NOT NULL, nationality TEXT DEFAULT 'FRA',
        league TEXT, license TEXT, category TEXT, status TEXT DEFAULT 'available',
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS phases (
        id TEXT PRIMARY KEY, competition_id TEXT NOT NULL,
        type TEXT NOT NULL, phase_order INTEGER NOT NULL, name TEXT NOT NULL,
        is_complete INTEGER DEFAULT 0, config TEXT,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pools (
        id TEXT PRIMARY KEY, phase_id TEXT NOT NULL,
        number INTEGER NOT NULL, strip INTEGER, start_time TEXT,
        is_complete INTEGER DEFAULT 0, has_error INTEGER DEFAULT 0,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pool_fencers (
        pool_id TEXT NOT NULL, fencer_id TEXT NOT NULL, position INTEGER NOT NULL,
        PRIMARY KEY (pool_id, fencer_id)
      );

      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY, number INTEGER NOT NULL,
        pool_id TEXT, table_id TEXT,
        fencer_a_id TEXT, fencer_b_id TEXT,
        score_a TEXT, score_b TEXT, max_score INTEGER NOT NULL,
        status TEXT DEFAULT 'not_started', referee_id TEXT,
        strip INTEGER, round INTEGER, position INTEGER,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS elimination_tables (
        id TEXT PRIMARY KEY, competition_id TEXT NOT NULL,
        name TEXT NOT NULL, size INTEGER NOT NULL, max_score INTEGER NOT NULL,
        first_place INTEGER DEFAULT 1, is_complete INTEGER DEFAULT 0,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS table_nodes (
        id TEXT PRIMARY KEY, table_id TEXT NOT NULL,
        position INTEGER NOT NULL, round INTEGER NOT NULL,
        match_id TEXT, winner_id TEXT, fencer_a_id TEXT, fencer_b_id TEXT,
        parent_a_id TEXT, parent_b_id TEXT, is_bye INTEGER DEFAULT 0,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
    `);
  }

  // Competition CRUD
  public createCompetition(comp: Partial<Competition>): Competition {
    if (!this.db) throw new Error('Database not open');
    const now = new Date().toISOString();
    const id = comp.id || uuidv4();

    this.db.prepare(`
      INSERT INTO competitions (id, title, date, weapon, gender, category, color, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, comp.title || 'Nouvelle compétition', comp.date?.toISOString() || now,
           comp.weapon || 'E', comp.gender || 'M', comp.category || 'SEN',
           comp.color || '#3B82F6', JSON.stringify(comp.settings || {}), now, now);

    return this.getCompetition(id)!;
  }

  public getCompetition(id: string): Competition | null {
    if (!this.db) throw new Error('Database not open');
    const row = this.db.prepare('SELECT * FROM competitions WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id, title: row.title, shortTitle: row.short_title,
      date: new Date(row.date), location: row.location, organizer: row.organizer,
      weapon: row.weapon as Weapon, gender: row.gender as Gender,
      category: row.category as Category, championship: row.championship,
      color: row.color, currentPhaseIndex: row.current_phase_index,
      isTeamEvent: row.is_team_event === 1, status: row.status,
      settings: row.settings ? JSON.parse(row.settings) : {},
      fencers: [], referees: [], phases: [],
      createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at),
    };
  }

  public getAllCompetitions(): Competition[] {
    if (!this.db) throw new Error('Database not open');
    const rows = this.db.prepare('SELECT * FROM competitions ORDER BY date DESC').all() as any[];
    return rows.map(r => this.getCompetition(r.id)!);
  }

  public deleteCompetition(id: string): void {
    if (!this.db) throw new Error('Database not open');
    this.db.prepare('DELETE FROM competitions WHERE id = ?').run(id);
  }

  // Fencer CRUD
  public addFencer(competitionId: string, fencer: Partial<Fencer>): Fencer {
    if (!this.db) throw new Error('Database not open');
    const now = new Date().toISOString();
    const id = fencer.id || uuidv4();
    const maxRef = this.db.prepare('SELECT MAX(ref) as m FROM fencers WHERE competition_id = ?').get(competitionId) as any;
    const ref = fencer.ref || (maxRef?.m || 0) + 1;

    this.db.prepare(`
      INSERT INTO fencers (id, competition_id, ref, last_name, first_name, gender, nationality, club, league, license, ranking, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, competitionId, ref, fencer.lastName || '', fencer.firstName || '',
           fencer.gender || 'M', fencer.nationality || 'FRA', fencer.club || null,
           fencer.league || null, fencer.license || null, fencer.ranking || null,
           fencer.status || 'N', now, now);

    return this.getFencer(id)!;
  }

  public getFencer(id: string): Fencer | null {
    if (!this.db) throw new Error('Database not open');
    const row = this.db.prepare('SELECT * FROM fencers WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id, ref: row.ref, lastName: row.last_name, firstName: row.first_name,
      birthDate: row.birth_date ? new Date(row.birth_date) : undefined,
      gender: row.gender as Gender, nationality: row.nationality,
      league: row.league, club: row.club, license: row.license,
      ranking: row.ranking, status: row.status as FencerStatus,
      seedNumber: row.seed_number, finalRanking: row.final_ranking,
      poolStats: row.pool_stats ? JSON.parse(row.pool_stats) : undefined,
      createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at),
    };
  }

  public getFencersByCompetition(competitionId: string): Fencer[] {
    if (!this.db) throw new Error('Database not open');
    const rows = this.db.prepare('SELECT * FROM fencers WHERE competition_id = ? ORDER BY ref').all(competitionId) as any[];
    return rows.map(r => this.getFencer(r.id)!);
  }

  public updateFencer(id: string, updates: Partial<Fencer>): void {
    if (!this.db) throw new Error('Database not open');
    const now = new Date().toISOString();
    const sets: string[] = ['updated_at = ?'];
    const vals: any[] = [now];

    if (updates.lastName !== undefined) { sets.push('last_name = ?'); vals.push(updates.lastName); }
    if (updates.firstName !== undefined) { sets.push('first_name = ?'); vals.push(updates.firstName); }
    if (updates.club !== undefined) { sets.push('club = ?'); vals.push(updates.club); }
    if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }
    if (updates.ranking !== undefined) { sets.push('ranking = ?'); vals.push(updates.ranking); }
    if (updates.poolStats !== undefined) { sets.push('pool_stats = ?'); vals.push(JSON.stringify(updates.poolStats)); }

    vals.push(id);
    this.db.prepare(`UPDATE fencers SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  }

  // Match CRUD
  public createMatch(match: Partial<Match>, poolId?: string): Match {
    if (!this.db) throw new Error('Database not open');
    const now = new Date().toISOString();
    const id = match.id || uuidv4();

    this.db.prepare(`
      INSERT INTO matches (id, number, pool_id, fencer_a_id, fencer_b_id, max_score, status, round, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, match.number || 1, poolId || null,
           match.fencerA?.id || null, match.fencerB?.id || null,
           match.maxScore || 5, match.status || 'not_started', match.round || null, now, now);

    return this.getMatch(id)!;
  }

  public getMatch(id: string): Match | null {
    if (!this.db) throw new Error('Database not open');
    const row = this.db.prepare('SELECT * FROM matches WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id, number: row.number,
      fencerA: row.fencer_a_id ? this.getFencer(row.fencer_a_id) : null,
      fencerB: row.fencer_b_id ? this.getFencer(row.fencer_b_id) : null,
      scoreA: row.score_a ? JSON.parse(row.score_a) : null,
      scoreB: row.score_b ? JSON.parse(row.score_b) : null,
      maxScore: row.max_score, status: row.status as MatchStatus,
      poolId: row.pool_id, tableId: row.table_id, round: row.round,
      createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at),
    };
  }

  public getMatchesByPool(poolId: string): Match[] {
    if (!this.db) throw new Error('Database not open');
    const rows = this.db.prepare('SELECT * FROM matches WHERE pool_id = ? ORDER BY number').all(poolId) as any[];
    return rows.map(r => this.getMatch(r.id)!);
  }

  public updateMatch(id: string, updates: Partial<Match>): void {
    if (!this.db) throw new Error('Database not open');
    const now = new Date().toISOString();
    const sets: string[] = ['updated_at = ?'];
    const vals: any[] = [now];

    if (updates.scoreA !== undefined) { sets.push('score_a = ?'); vals.push(JSON.stringify(updates.scoreA)); }
    if (updates.scoreB !== undefined) { sets.push('score_b = ?'); vals.push(JSON.stringify(updates.scoreB)); }
    if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }

    vals.push(id);
    this.db.prepare(`UPDATE matches SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  }

  // Pool operations
  public createPool(phaseId: string, number: number): Pool {
    if (!this.db) throw new Error('Database not open');
    const now = new Date().toISOString();
    const id = uuidv4();

    this.db.prepare(`
      INSERT INTO pools (id, phase_id, number, is_complete, has_error, created_at, updated_at)
      VALUES (?, ?, ?, 0, 0, ?, ?)
    `).run(id, phaseId, number, now, now);

    return { id, number, phaseId, fencers: [], matches: [], referees: [],
             isComplete: false, hasError: false, ranking: [],
             createdAt: new Date(now), updatedAt: new Date(now) };
  }

  public addFencerToPool(poolId: string, fencerId: string, position: number): void {
    if (!this.db) throw new Error('Database not open');
    this.db.prepare('INSERT OR REPLACE INTO pool_fencers (pool_id, fencer_id, position) VALUES (?, ?, ?)').run(poolId, fencerId, position);
  }

  public getPoolFencers(poolId: string): Fencer[] {
    if (!this.db) throw new Error('Database not open');
    const rows = this.db.prepare(`
      SELECT f.id FROM fencers f JOIN pool_fencers pf ON f.id = pf.fencer_id
      WHERE pf.pool_id = ? ORDER BY pf.position
    `).all(poolId) as any[];
    return rows.map(r => this.getFencer(r.id)!);
  }

  // Export/Import
  public exportToFile(filepath: string): void {
    if (!this.db) throw new Error('Database not open');
    fs.copyFileSync(this.dbPath, filepath);
  }

  public importFromFile(filepath: string): void {
    this.close();
    this.dbPath = filepath;
    this.open();
  }
}

export const db = new DatabaseManager();
