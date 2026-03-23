import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getNewMenuItems,
  getAllMenuItems,
  createReservation,
  getUserReservations,
  getReservationById,
  updateReservationStatus,
  createNotification,
  getOwnerNotifications,
  getUserById,
  getUserByLineUserId,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { jwtVerify } from "jose";
import { ENV } from "./_core/env";
import { upsertUser } from "./db";
import { sdk } from "./_core/sdk";
import {
  getReservationStats,
  getAllReservationsWithUsers,
  getTotalReservationsCount,
  getReservationChartData,
  searchReservations,
} from "./admin";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    lineLogin: publicProcedure
      .input(z.object({ idToken: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Verify and decode LINE ID token
          const secret = new TextEncoder().encode(ENV.lineChannelAccessToken || "dummy-secret");
          const verified = await jwtVerify(input.idToken, secret);
          const payload = verified.payload as any;
          
          const lineUserId = payload.sub;
          const lineDisplayName = payload.name || "Unknown";
          const lineProfilePictureUrl = payload.picture || null;
          
          if (!lineUserId) {
            throw new Error("Invalid LINE ID token: missing sub");
          }
          
          // Check if user exists by lineUserId
          let user = await getUserByLineUserId(lineUserId) as any;
          
          if (!user) {
            // Create new user with LINE info
            // Generate a unique openId for this LINE user
            const openId = `line_${lineUserId}`;
            await upsertUser({
              openId,
              name: lineDisplayName,
              lineUserId,
              lineDisplayName,
              lineProfilePictureUrl,
              loginMethod: "line",
              lastSignedIn: new Date(),
            });
            user = await getUserByLineUserId(lineUserId) as any;
          } else {
            // Update existing user with latest LINE info
            await upsertUser({
              openId: user.openId,
              lineDisplayName,
              lineProfilePictureUrl,
              lastSignedIn: new Date(),
            });
          }
          
          if (!user) {
            throw new Error("Failed to create or retrieve user");
          }
          
          // Create session token and set cookie
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || lineDisplayName,
            expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 year
          });
          
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: 365 * 24 * 60 * 60 * 1000,
          });
          
          return {
            success: true,
            user: {
              id: user.id,
              name: user.name,
              openId: user.openId,
              lineUserId: user.lineUserId,
              lineDisplayName: user.lineDisplayName,
              lineProfilePictureUrl: user.lineProfilePictureUrl,
            },
          };
        } catch (error) {
          console.error("[LINE Login] Error:", error);
          throw new Error(`LINE authentication failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }),
  }),

  // Menu procedures
  menu: router({
    getNewItems: publicProcedure.query(async () => {
      return await getNewMenuItems();
    }),

    getAllItems: publicProcedure.query(async () => {
      return await getAllMenuItems();
    }),
  }),

  // Reservation procedures
  reservations: router({
    create: publicProcedure
      .input(
        z.object({
          reservationDate: z.date(),
          reservationTime: z.string().regex(/^\d{2}:\d{2}$/),
          numberOfGuests: z.number().int().min(1).max(20),
          specialNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const result = await createReservation({
          userId: ctx.user.id,
          reservationDate: input.reservationDate,
          reservationTime: input.reservationTime,
          numberOfGuests: input.numberOfGuests,
          specialNotes: input.specialNotes,
        });

        // Drizzle returns the result with insertId in different formats
        let reservationId: number | undefined;
        
        if (result && typeof result === 'object') {
          const res = result as any;
          if ('insertId' in res && res.insertId) {
            reservationId = Number(res.insertId);
          } else if ('meta' in res && res.meta && 'insertId' in res.meta) {
            reservationId = Number(res.meta.insertId);
          }
        }

        // Fallback: get the most recent reservation for this user
        if (!reservationId || isNaN(reservationId)) {
          const userReservations = await getUserReservations(ctx.user.id);
          if (userReservations.length > 0) {
            reservationId = userReservations[0].id;
          } else {
            throw new Error("Failed to create reservation");
          }
        }

        const reservation = await getReservationById(reservationId);

        if (reservation) {
          // Create notification for owner
          const owner = await getUserById(ctx.user!.id);
          if (owner && owner.role === "admin") {
            // If current user is admin, notify them
            await createNotification({
              reservationId: Number(reservationId),
              userId: ctx.user!.id,
              type: "new_reservation",
              title: "การจองโต๊ะใหม่",
              content: `มีการจองโต๊ะใหม่ - ${input.numberOfGuests} ท่าน วันที่ ${input.reservationDate.toLocaleDateString("th-TH")} เวลา ${input.reservationTime}`,
            });

            // Send owner notification via built-in system
            await notifyOwner({
              title: "📅 การจองโต๊ะใหม่",
              content: `ชื่อผู้จอง: ${ctx.user!.name || "ไม่ระบุ"}\nจำนวนคน: ${input.numberOfGuests} ท่าน\nวันที่: ${input.reservationDate.toLocaleDateString("th-TH")}\nเวลา: ${input.reservationTime}\n${input.specialNotes ? `หมายเหตุ: ${input.specialNotes}` : ""}`,
            });
          }
        }

        return {
          success: true,
          reservationId: Number(reservationId),
        };
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }
      return await getUserReservations(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const reservation = await getReservationById(input.id);
        if (!reservation || (ctx.user && reservation.userId !== ctx.user.id)) {
          throw new Error("Reservation not found or unauthorized");
        }
        return reservation;
      }),

    updateStatus: publicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const reservation = await getReservationById(input.id);
        if (!reservation || (reservation.userId !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new Error("Reservation not found or unauthorized");
        }

        await updateReservationStatus(input.id, input.status);

        return { success: true };
      }),
  }),

  // Notification procedures
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admin can view notifications");
      }
      return await getOwnerNotifications(ctx.user.id);
    }),
  }),

  // Admin procedures
  admin: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admin can view statistics");
      }
      return await getReservationStats();
    }),

    reservations: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().min(1).max(100).default(50),
          offset: z.number().int().min(0).default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admin can view all reservations");
        }
        const reservations = await getAllReservationsWithUsers(
          input.limit,
          input.offset
        );
        const total = await getTotalReservationsCount();
        return { reservations, total };
      }),

    chartData: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admin can view chart data");
      }
      return await getReservationChartData();
    }),

    search: protectedProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().int().min(1).max(100).default(50),
          offset: z.number().int().min(0).default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admin can search reservations");
        }
        return await searchReservations(input.query, input.limit, input.offset);
      }),

    updateReservationStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admin can update reservation status");
        }
        await updateReservationStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
