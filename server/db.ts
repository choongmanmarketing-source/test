import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, menuItems, reservations, notifications, MenuItem, Reservation, Notification } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "lineUserId", "lineDisplayName", "lineProfilePictureUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByLineUserId(lineUserId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.lineUserId, lineUserId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Menu queries
export async function getNewMenuItems() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.isNew, true), eq(menuItems.isAvailable, true)))
    .orderBy(desc(menuItems.createdAt));
}

export async function getAllMenuItems() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.isAvailable, true))
    .orderBy(desc(menuItems.createdAt));
}

// Reservation queries
export async function createReservation(data: {
  userId: number;
  reservationDate: Date;
  reservationTime: string;
  numberOfGuests: number;
  specialNotes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reservations).values({
    userId: data.userId,
    reservationDate: data.reservationDate,
    reservationTime: data.reservationTime,
    numberOfGuests: data.numberOfGuests,
    specialNotes: data.specialNotes || null,
    status: "pending",
  });

  return result;
}

export async function getUserReservations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reservations)
    .where(eq(reservations.userId, userId))
    .orderBy(desc(reservations.reservationDate));
}

export async function getReservationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateReservationStatus(id: number, status: "pending" | "confirmed" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(reservations)
    .set({ status })
    .where(eq(reservations.id, id));
}

// Notification queries
export async function createNotification(data: {
  reservationId: number;
  userId: number;
  type: string;
  title: string;
  content: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values({
    reservationId: data.reservationId,
    userId: data.userId,
    type: data.type,
    title: data.title,
    content: data.content,
    isRead: false,
  });
}

export async function getOwnerNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}
