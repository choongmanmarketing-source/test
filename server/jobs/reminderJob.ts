/**
 * Reservation Reminder Job
 * Sends LINE messages to users 24 hours before their reservation
 */

import { getDb } from "../db";
import { reservations, users } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendLineMessage, buildReservationReminderFlexMessage } from "../lib/lineMessaging";

/**
 * Check for reservations that need reminders (24 hours from now)
 * and send LINE messages to users
 */
export async function sendReservationReminders(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Reminder Job] Database not available");
      return;
    }

    // Calculate 24-hour window
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000); // Add 1 hour buffer

    console.log(`[Reminder Job] Checking for reservations between ${tomorrow} and ${tomorrowEnd}`);

    // Find reservations that are 24 hours away
    const upcomingReservations = await db
      .select({
        reservation: reservations,
        user: users,
      })
      .from(reservations)
      .innerJoin(users, eq(reservations.userId, users.id))
      .where(
        and(
          gte(reservations.reservationDate, tomorrow),
          lte(reservations.reservationDate, tomorrowEnd),
          eq(reservations.status, "confirmed")
        )
      );

    console.log(
      `[Reminder Job] Found ${upcomingReservations.length} reservations to remind`
    );

    // Send reminders to each user
    for (const { reservation, user } of upcomingReservations) {
      if (!user.lineUserId) {
        console.warn(
          `[Reminder Job] User ${user.id} does not have LINE user ID`
        );
        continue;
      }

      try {
        const flexMessage = buildReservationReminderFlexMessage(
          reservation.id,
          reservation.reservationDate,
          reservation.reservationTime,
          reservation.numberOfGuests,
          reservation.specialNotes || undefined
        );

        const success = await sendLineMessage(user.lineUserId, flexMessage);

        if (success) {
          console.log(
            `[Reminder Job] Sent reminder to user ${user.id} for reservation #${reservation.id}`
          );
        } else {
          console.error(
            `[Reminder Job] Failed to send reminder to user ${user.id}`
          );
        }
      } catch (error) {
        console.error(
          `[Reminder Job] Error sending reminder for reservation #${reservation.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[Reminder Job] Error in reminder job:", error);
  }
}

/**
 * Schedule the reminder job to run every hour
 */
export function scheduleReminderJob(): void {
  // Run immediately on startup
  sendReservationReminders().catch(console.error);

  // Then run every hour
  setInterval(() => {
    sendReservationReminders().catch(console.error);
  }, 60 * 60 * 1000); // 1 hour

  console.log("[Reminder Job] Scheduled to run every hour");
}
