import { useLiff } from "@/contexts/LiffContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Loader2, Calendar, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const statusConfig = {
  pending: {
    label: "รอการยืนยัน",
    color: "bg-yellow-100 text-yellow-800",
  },
  confirmed: {
    label: "ยืนยันแล้ว",
    color: "bg-green-100 text-green-800",
  },
  completed: {
    label: "เสร็จสิ้น",
    color: "bg-blue-100 text-blue-800",
  },
  cancelled: {
    label: "ยกเลิก",
    color: "bg-red-100 text-red-800",
  },
};

export default function Reservations() {
  const { isLineLoggedInStatus, isLoading: liffLoading } = useLiff();
  const { data: reservations, isLoading } = trpc.reservations.list.useQuery(
    undefined,
    { enabled: isLineLoggedInStatus }
  );

  if (liffLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isLineLoggedInStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-muted-foreground mb-6">
            คุณต้องเข้าสู่ระบบเพื่อดูการจองของคุณ
          </p>
          <Link href="/line-login">
            <Button className="btn-elegant">เข้าสู่ระบบด้วย LINE</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              กลับ
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">การจองของฉัน</h1>
          <Link href="/reservation/new">
            <Button size="sm" className="btn-elegant">
              จองใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : !reservations || reservations.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              ยังไม่มีการจอง
            </h2>
            <p className="text-muted-foreground mb-6">
              คุณยังไม่มีการจองโต๊ะ ไปจองเลยวันนี้!
            </p>
            <Link href="/menu">
              <Button className="btn-elegant">ดูเมนูและจอง</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const reservationDate = new Date(reservation.reservationDate);
              const status = statusConfig[
                reservation.status as keyof typeof statusConfig
              ] || statusConfig.pending;

              return (
                <Card
                  key={reservation.id}
                  className="card-elegant hover:shadow-elegant-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          การจองที่ #{reservation.id}
                        </h3>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span>
                            {format(reservationDate, "d MMMM yyyy", {
                              locale: th,
                            })}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-accent" />
                          <span>{reservation.reservationTime} น.</span>
                        </div>

                        {/* Guests */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4 text-accent" />
                          <span>{reservation.numberOfGuests} ท่าน</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {reservation.specialNotes && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            หมายเหตุ:
                          </p>
                          <p className="text-sm text-foreground">
                            {reservation.specialNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Content */}
                    <div className="flex gap-2">
                      {reservation.status === "pending" && (
                        <>
                          <Button variant="outline" size="sm">
                            แก้ไข
                          </Button>
                          <Button variant="destructive" size="sm">
                            ยกเลิก
                          </Button>
                        </>
                      )}
                      {reservation.status === "confirmed" && (
                        <Button variant="destructive" size="sm">
                          ยกเลิก
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
