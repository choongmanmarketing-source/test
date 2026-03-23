/**
 * Admin database helpers for dashboard statistics and management
 */

import { getDb } from "./db";
import { reservations, users } from "../drizzle/schema";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";

export interface ReservationStats {
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  confirmedToday: number;
  pendingToday: number;
  completedThisMonth: number;
}

export interface ReservationWithUser {
  id: number;
  userId: number;
  reservationDate: Date;
  reservationTime: string;
  numberOfGuests: number;
  specialNotes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
  userLineId: string | null;
}

export interface ReservationChartData {
  date: string;
  count: number;
}

/**
 * Get reservation statistics
 */
export async function getReservationStats(): Promise<ReservationStats> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Today stats
  const totalTodayResult = await db
    .select({ count: count() })
    .from(reservations)
    .where(
      and(
        gte(reservations.reservationDate, todayStart),
        lte(reservations.reservationDate, todayEnd)
      )
    );

  const confirmedTodayResult = await db
    .select({ count: count() })
    .from(reservations)
    .where(
      and(
        gte(reservations.reservationDate, todayStart),
        lte(reservations.reservationDate, todayEnd),
        eq(reservations.status, "confirmed")
      )
    );

  const pendingTodayResult = await db
    .select({ count: count() })
    .from(reservations)
    .where(
      and(
        gte(reservations.reservationDate, todayStart),
        lte(reservations.reservationDate, todayEnd),
        eq(reservations.status, "pending")
      )
    );

  // This week stats
  const totalThisWeekResult = await db
    .select({ count: count() })
    .from(reservations)
    .where(
      and(
        gte(reservations.reservationDate, weekStart),
        lte(reservations.reservationDate, weekEnd)
      )
    );

  // This month stats
  const totalThisMonthResult = await db
    .select({ count: count() })
    .from(reservations)
    .where(
      and(
        gte(reservations.reservationDate, monthStart),
        lte(reservations.reservationDate, monthEnd)
      )
    );

  const completedThisMonthResult = await db
    .select({ count: count() })
    .from(reservations)
    .where(
      and(
        gte(reservations.reservationDate, monthStart),
        lte(reservations.reservationDate, monthEnd),
        eq(reservations.status, "completed")
      )
    );

  return {
    totalToday: totalTodayResult[0]?.count ?? 0,
    totalThisWeek: totalThisWeekResult[0]?.count ?? 0,
    totalThisMonth: totalThisMonthResult[0]?.count ?? 0,
    confirmedToday: confirmedTodayResult[0]?.count ?? 0,
    pendingToday: pendingTodayResult[0]?.count ?? 0,
    completedThisMonth: completedThisMonthResult[0]?.count ?? 0,
  };
}

/**
 * Get all reservations with user info for admin view
 */
export async function getAllReservationsWithUsers(
  limit: number = 50,
  offset: number = 0
): Promise<ReservationWithUser[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const results = await db
    .select({
      id: reservations.id,
      userId: reservations.userId,
      reservationDate: reservations.reservationDate,
      reservationTime: reservations.reservationTime,
      numberOfGuests: reservations.numberOfGuests,
      specialNotes: reservations.specialNotes,
      status: reservations.status,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
      userName: users.name,
      userEmail: users.email,
      userLineId: users.lineUserId,
    })
    .from(reservations)
    .innerJoin(users, eq(reservations.userId, users.id))
    .orderBy(sql`${reservations.reservationDate} DESC`)
    .limit(limit)
    .offset(offset);

  return results as ReservationWithUser[];
}

/**
 * Get total count of reservations
 */
export async function getTotalReservationsCount(): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({ count: count() })
    .from(reservations);

  return result[0]?.count ?? 0;
}

/**
 * Get reservation chart data for the last 30 days
 */
export async function getReservationChartData(): Promise<ReservationChartData[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const results = await db
    .select({
      date: sql<string>`DATE(${reservations.reservationDate})`,
      count: count(),
    })
    .from(reservations)
    .where(gte(reservations.reservationDate, thirtyDaysAgo))
    .groupBy(sql`DATE(${reservations.reservationDate})`)
    .orderBy(sql`DATE(${reservations.reservationDate})`);

  return results.map((r) => ({
    date: r.date,
    count: r.count,
  }));
}

/**
 * Search reservations by user name or email
 */
export async function searchReservations(
  query: string,
  limit: number = 50,
  offset: number = 0
): Promise<ReservationWithUser[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const searchPattern = `%${query}%`;

  const results = await db
    .select({
      id: reservations.id,
      userId: reservations.userId,
      reservationDate: reservations.reservationDate,
      reservationTime: reservations.reservationTime,
      numberOfGuests: reservations.numberOfGuests,
      specialNotes: reservations.specialNotes,
      status: reservations.status,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
      userName: users.name,
      userEmail: users.email,
      userLineId: users.lineUserId,
    })
    .from(reservations)
    .innerJoin(users, eq(reservations.userId, users.id))
    .where(
      sql`${users.name} LIKE ${searchPattern} OR ${users.email} LIKE ${searchPattern}`
    )
    .orderBy(sql`${reservations.reservationDate} DESC`)
    .limit(limit)
    .offset(offset);

  return results as ReservationWithUser[];
}
