/**
 * LINE Messaging API Integration
 * Handles sending messages to users via LINE
 */

import axios from "axios";
import { ENV } from "../_core/env";

export interface LineFlexMessage {
  type: "flex";
  altText: string;
  contents: any;
}

export interface LineTextMessage {
  type: "text";
  text: string;
}

type LineMessage = LineFlexMessage | LineTextMessage;

/**
 * Send a message to a user via LINE Messaging API
 */
export async function sendLineMessage(
  userId: string,
  message: LineMessage
): Promise<boolean> {
  try {
    if (!ENV.lineChannelAccessToken) {
      console.warn("LINE_CHANNEL_ACCESS_TOKEN not configured");
      return false;
    }

    const response = await axios.post(
      "https://api.line.biz/v2/bot/message/push",
      {
        to: userId,
        messages: [message],
      },
      {
        headers: {
          Authorization: `Bearer ${ENV.lineChannelAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error("Failed to send LINE message:", error);
    return false;
  }
}

/**
 * Build a Flex Message for reservation reminder
 */
export function buildReservationReminderFlexMessage(
  reservationId: number,
  reservationDate: Date,
  reservationTime: string,
  numberOfGuests: number,
  specialNotes?: string
): LineFlexMessage {
  const date = new Date(reservationDate);
  const dateStr = date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    type: "flex",
    altText: `⏰ เตือนการจอง #${reservationId}: ${dateStr} เวลา ${reservationTime}`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#E67E22",
        paddingAll: "20px",
        contents: [
          {
            type: "text",
            text: "⏰ เตือนการจอง",
            size: "xl",
            weight: "bold",
            color: "#FFFFFF",
            align: "center",
          },
          {
            type: "text",
            text: "ใกล้ถึงเวลาการจองของคุณแล้ว",
            size: "sm",
            color: "#FFFFFF",
            align: "center",
            margin: "md",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#FFF9E6",
            paddingAll: "12px",
            borderRadius: "8px",
            borderColor: "#E67E22",
            borderWidth: "2px",
            contents: [
              {
                type: "text",
                text: "📅 วันที่และเวลา",
                size: "sm",
                weight: "bold",
                color: "#333333",
              },
              {
                type: "text",
                text: `${dateStr} เวลา ${reservationTime} น.`,
                size: "lg",
                weight: "bold",
                color: "#E67E22",
                margin: "md",
              },
            ],
          },
          {
            type: "box",
            layout: "baseline",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "👥 จำนวนคน",
                size: "sm",
                color: "#999999",
                flex: 2,
              },
              {
                type: "text",
                text: `${numberOfGuests} ท่าน`,
                size: "sm",
                color: "#333333",
                flex: 3,
                weight: "bold",
              },
            ],
          },
          ...(specialNotes
            ? [
                {
                  type: "box",
                  layout: "vertical",
                  margin: "md",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "📝 หมายเหตุ",
                      size: "sm",
                      color: "#999999",
                    },
                    {
                      type: "text",
                      text: specialNotes,
                      size: "sm",
                      color: "#333333",
                      wrap: true,
                    },
                  ],
                },
              ]
            : []),
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: `หมายเลขการจอง: #${reservationId}`,
                size: "xs",
                color: "#999999",
                align: "center",
              },
              {
                type: "text",
                text: "โปรดยืนยันว่าคุณจะมาถึงตรงเวลา",
                size: "xs",
                color: "#E67E22",
                align: "center",
                weight: "bold",
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "uri",
              label: "ดูรายละเอียด",
              uri: "https://liff.line.me/YOUR_LIFF_ID", // Will be replaced with actual LIFF ID
            },
            color: "#E67E22",
          },
        ],
      },
    },
  };
}

/**
 * Build a text message for reservation reminder (fallback)
 */
export function buildReservationReminderTextMessage(
  reservationId: number,
  reservationDate: Date,
  reservationTime: string,
  numberOfGuests: number
): LineTextMessage {
  const date = new Date(reservationDate);
  const dateStr = date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    type: "text",
    text: `⏰ เตือนการจอง #${reservationId}\n\n📅 ${dateStr}\n🕐 ${reservationTime} น.\n👥 ${numberOfGuests} ท่าน\n\nโปรดยืนยันว่าคุณจะมาถึงตรงเวลา`,
  };
}
