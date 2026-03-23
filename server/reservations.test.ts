import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("reservations", () => {
  describe("create", () => {
    it("should create a reservation with valid data", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const reservationDate = new Date();
      reservationDate.setDate(reservationDate.getDate() + 7); // 7 days from now

      const result = await caller.reservations.create({
        reservationDate,
        reservationTime: "19:00",
        numberOfGuests: 4,
        specialNotes: "Window seat preferred",
      });

      expect(result.success).toBe(true);
      expect(result.reservationId).toBeDefined();
      expect(typeof result.reservationId).toBe("number");
    });

    it("should reject invalid reservation time format", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const reservationDate = new Date();
      reservationDate.setDate(reservationDate.getDate() + 7);

      await expect(
        caller.reservations.create({
          reservationDate,
          reservationTime: "1900", // Invalid format
          numberOfGuests: 4,
        })
      ).rejects.toThrow();
    });

    it("should reject invalid number of guests", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const reservationDate = new Date();
      reservationDate.setDate(reservationDate.getDate() + 7);

      await expect(
        caller.reservations.create({
          reservationDate,
          reservationTime: "19:00",
          numberOfGuests: 0, // Invalid
        })
      ).rejects.toThrow();
    });

    it("should allow optional special notes", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const reservationDate = new Date();
      reservationDate.setDate(reservationDate.getDate() + 7);

      const result = await caller.reservations.create({
        reservationDate,
        reservationTime: "19:00",
        numberOfGuests: 2,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("list", () => {
    it("should return user's reservations", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const reservations = await caller.reservations.list();

      expect(Array.isArray(reservations)).toBe(true);
    });

    it("should throw error if not authenticated", async () => {
      const ctx = {
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: {} as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      await expect(caller.reservations.list()).rejects.toThrow();
    });
  });

  describe("updateStatus", () => {
    it("should update reservation status for owner", async () => {
      const ctx = createAuthContext(1);
      ctx.user!.role = "admin";
      const caller = appRouter.createCaller(ctx);

      // Create a reservation first
      const reservationDate = new Date();
      reservationDate.setDate(reservationDate.getDate() + 7);

      const createResult = await caller.reservations.create({
        reservationDate,
        reservationTime: "19:00",
        numberOfGuests: 2,
      });

      // Update status
      const updateResult = await caller.reservations.updateStatus({
        id: createResult.reservationId,
        status: "confirmed",
      });

      expect(updateResult.success).toBe(true);
    });

    it("should reject invalid status", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.reservations.updateStatus({
          id: 1,
          status: "invalid" as any,
        })
      ).rejects.toThrow();
    });
  });
});
