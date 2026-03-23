/**
 * Line Share Utilities
 * Helper functions to share reservation details via Line Flex Messages
 */

export interface ReservationShareData {
  id: number;
  reservationDate: Date;
  reservationTime: string;
  numberOfGuests: number;
  specialNotes?: string;
}

/**
 * Build a Flex Message for sharing reservation details
 * Reference: https://developers.line.biz/en/docs/messaging-api/using-flex-messages/
 */
export function buildReservationFlexMessage(
  reservation: ReservationShareData
): any {
  const date = new Date(reservation.reservationDate);
  const dateStr = date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    type: "flex",
    altText: `การจองโต๊ะ #${reservation.id} - ${dateStr} เวลา ${reservation.reservationTime}`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#D4A574",
        paddingAll: "20px",
        contents: [
          {
            type: "text",
            text: "🍽️ Fine Dining",
            size: "xl",
            weight: "bold",
            color: "#FFFFFF",
            align: "center",
          },
          {
            type: "text",
            text: "การจองโต๊ะของคุณ",
            size: "md",
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
            layout: "baseline",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "📅 วันที่",
                size: "sm",
                color: "#999999",
                flex: 2,
              },
              {
                type: "text",
                text: dateStr,
                size: "sm",
                color: "#333333",
                flex: 3,
                weight: "bold",
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
                text: "🕐 เวลา",
                size: "sm",
                color: "#999999",
                flex: 2,
              },
              {
                type: "text",
                text: `${reservation.reservationTime} น.`,
                size: "sm",
                color: "#333333",
                flex: 3,
                weight: "bold",
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
                text: `${reservation.numberOfGuests} ท่าน`,
                size: "sm",
                color: "#333333",
                flex: 3,
                weight: "bold",
              },
            ],
          },
          ...(reservation.specialNotes
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
                      text: reservation.specialNotes,
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
                text: `หมายเลขการจอง: #${reservation.id}`,
                size: "xs",
                color: "#999999",
                align: "center",
              },
              {
                type: "text",
                text: "ขอบคุณที่ทำการจอง",
                size: "xs",
                color: "#999999",
                align: "center",
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
              label: "ดูรายละเอียดเพิ่มเติม",
              uri: `${window.location.origin}/reservations`,
            },
            color: "#D4A574",
          },
        ],
      },
    },
  };
}

/**
 * Share reservation to Line chat using LIFF
 */
export async function shareReservationToLine(
  reservation: ReservationShareData
): Promise<boolean> {
  try {
    if (!window.liff) {
      console.error("LIFF not initialized");
      return false;
    }

    const flexMessage = buildReservationFlexMessage(reservation);

    // Use LIFF sendMessages API to send message to the current chat
    await window.liff.sendMessages([flexMessage]);

    return true;
  } catch (error) {
    console.error("Failed to share reservation to Line:", error);
    return false;
  }
}

/**
 * Check if LIFF is available and in a chat context
 */
export function canShareToLine(): boolean {
  if (!window.liff) return false;

  try {
    // Check if we're in a LINE app context
    const context = (window.liff as any).getContext?.();
    return context && context.type !== "none";
  } catch {
    return false;
  }
}
