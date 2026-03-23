import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildReservationReminderFlexMessage,
  buildReservationReminderTextMessage,
} from "./lineMessaging";

describe("lineMessaging", () => {
  const mockReservationDate = new Date("2026-04-15T19:00:00Z");

  describe("buildReservationReminderFlexMessage", () => {
    it("should build a valid Flex Message structure", () => {
      const message = buildReservationReminderFlexMessage(
        123,
        mockReservationDate,
        "19:00",
        4,
        "Window seat preferred"
      );

      expect(message).toBeDefined();
      expect(message.type).toBe("flex");
      expect(message.altText).toBeDefined();
      expect(message.contents).toBeDefined();
      expect(message.contents.type).toBe("bubble");
    });

    it("should include reservation ID in altText", () => {
      const message = buildReservationReminderFlexMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      expect(message.altText).toContain("123");
    });

    it("should include all required reservation details", () => {
      const message = buildReservationReminderFlexMessage(
        123,
        mockReservationDate,
        "19:00",
        4,
        "Window seat preferred"
      );

      const messageStr = JSON.stringify(message);

      expect(messageStr).toContain("19:00");
      expect(messageStr).toContain("4");
      expect(messageStr).toContain("ท่าน");
    });

    it("should include special notes when provided", () => {
      const message = buildReservationReminderFlexMessage(
        123,
        mockReservationDate,
        "19:00",
        4,
        "Window seat preferred"
      );

      const messageStr = JSON.stringify(message);
      expect(messageStr).toContain("Window seat preferred");
    });

    it("should not include special notes section when not provided", () => {
      const message = buildReservationReminderFlexMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      const messageStr = JSON.stringify(message);
      // Should not have the notes section if undefined
      const notesCount = (messageStr.match(/📝 หมายเหตุ/g) || []).length;
      expect(notesCount).toBe(0);
    });

    it("should have correct reminder styling with orange color", () => {
      const message = buildReservationReminderFlexMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      const messageStr = JSON.stringify(message);
      expect(messageStr).toContain("#E67E22"); // Orange color
    });

    it("should include warning text about arriving on time", () => {
      const message = buildReservationReminderFlexMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      const messageStr = JSON.stringify(message);
      expect(messageStr).toContain("โปรดยืนยันว่าคุณจะมาถึงตรงเวลา");
    });
  });

  describe("buildReservationReminderTextMessage", () => {
    it("should build a valid text message", () => {
      const message = buildReservationReminderTextMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      expect(message).toBeDefined();
      expect(message.type).toBe("text");
      expect(message.text).toBeDefined();
      expect(typeof message.text).toBe("string");
    });

    it("should include reservation ID", () => {
      const message = buildReservationReminderTextMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      expect(message.text).toContain("#123");
    });

    it("should include all reservation details", () => {
      const message = buildReservationReminderTextMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      expect(message.text).toContain("19:00");
      expect(message.text).toContain("4");
      expect(message.text).toContain("ท่าน");
    });

    it("should include reminder emoji", () => {
      const message = buildReservationReminderTextMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      expect(message.text).toContain("⏰");
    });

    it("should include call to action", () => {
      const message = buildReservationReminderTextMessage(
        123,
        mockReservationDate,
        "19:00",
        4
      );

      expect(message.text).toContain("โปรดยืนยันว่าคุณจะมาถึงตรงเวลา");
    });
  });
});
