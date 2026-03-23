import { useAuth } from "@/_core/hooks/useAuth";
import { useLiff } from "@/contexts/LiffContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, CheckCircle, Share2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { shareReservationToLine, canShareToLine } from "@/lib/lineShare";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Sample branches
const BRANCHES = [
  { id: "1", name: "สาขาสยามสแควร์" },
  { id: "2", name: "สาขาเอมควอเทียร์" },
  { id: "3", name: "สาขาสิยาม" },
  { id: "4", name: "สาขาเซนทรัล" },
  { id: "5", name: "สาขาสยามพารากอน" },
  { id: "6", name: "สาขาพลาซ่า" },
  { id: "7", name: "สาขาเดอะมอลล์" },
  { id: "8", name: "สาขาเมเจอร์" },
  { id: "9", name: "สาขาเอมสเปส" },
  { id: "10", name: "สาขาลุมพินี" },
];

interface ConfirmationData {
  id: number;
  date: Date;
  time: string;
  guests: number;
  notes?: string;
  branch: string;
}

export default function Reservation() {
  const { isAuthenticated } = useAuth();
  const { isLineLoggedInStatus, lineProfile, isLoading: liffLoading } = useLiff();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    branch: BRANCHES[0].id,
    date: "",
    time: "19:00",
    guests: 2,
    notes: "",
  });
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const createReservation = trpc.reservations.create.useMutation({
    onSuccess: (result) => {
      setConfirmationData({
        id: result.reservationId,
        date: new Date(formData.date),
        time: formData.time,
        guests: formData.guests,
        notes: formData.notes || undefined,
        branch: formData.branch,
      });
      toast.success("จองโต๊ะสำเร็จแล้ว!");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการจอง");
    },
  });

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
            คุณต้องเข้าสู่ระบบเพื่อจองโต๊ะ
          </p>
          <Link href="/line-login">
            <Button className="btn-elegant">เข้าสู่ระบบด้วย LINE</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast.error("กรุณาเลือกวันที่");
      return;
    }

    createReservation.mutate({
      reservationDate: new Date(formData.date),
      reservationTime: formData.time,
      numberOfGuests: formData.guests,
      specialNotes: formData.notes || undefined,
    });
  };

  const handleShare = async () => {
    if (!confirmationData) return;

    setIsSharing(true);
    try {
      const success = await shareReservationToLine({
        id: confirmationData.id,
        reservationDate: confirmationData.date,
        reservationTime: confirmationData.time,
        numberOfGuests: confirmationData.guests,
        specialNotes: confirmationData.notes,
      });

      if (success) {
        toast.success("แชร์การจองไปยัง Line สำเร็จ!");
      } else {
        toast.error("ไม่สามารถแชร์ได้ กรุณาลองใหม่");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการแชร์");
    } finally {
      setIsSharing(false);
    }
  };

  // Confirmation screen
  if (confirmationData) {
    const dateStr = format(confirmationData.date, "d MMMM yyyy", { locale: th });
    const branchName = BRANCHES.find((b) => b.id === confirmationData.branch)?.name;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
          <div className="container flex items-center justify-between h-16">
            <Link href="/menu">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                กลับ
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">สรุปการจอง</h1>
            {/* User Profile */}
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                {lineProfile?.pictureUrl && (
                  <AvatarImage src={lineProfile.pictureUrl} alt={lineProfile.displayName} />
                )}
                <AvatarFallback>
                  {lineProfile?.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                {lineProfile?.displayName}
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Content */}
        <div className="container py-12">
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <CheckCircle className="w-20 h-20 text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-2">
                จองสำเร็จ!
              </h2>
              <p className="text-muted-foreground">
                ขอบคุณที่ทำการจองโต๊ะ เราจะติดต่อคุณในไม่ช้า
              </p>
            </div>

            {/* Reservation Details Card */}
            <Card className="card-elegant mb-6">
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">
                    รายละเอียดการจอง
                  </h3>
                </div>

                {/* Booking Number */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    หมายเลขการจอง
                  </p>
                  <p className="text-2xl font-bold text-accent">
                    #{confirmationData.id}
                  </p>
                </div>

                {/* Branch */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    สาขา
                  </p>
                  <p className="font-semibold text-foreground">{branchName}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">📅 วันที่</p>
                    <p className="font-semibold text-foreground">{dateStr}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">🕐 เวลา</p>
                    <p className="font-semibold text-foreground">
                      {confirmationData.time} น.
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">👥 จำนวนคน</p>
                    <p className="font-semibold text-foreground">
                      {confirmationData.guests} ท่าน
                    </p>
                  </div>
                </div>

                {/* Special Notes */}
                {confirmationData.notes && (
                  <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      📝 หมายเหตุพิเศษ
                    </p>
                    <p className="text-sm text-foreground">
                      {confirmationData.notes}
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    ℹ️ เราจะติดต่อคุณเพื่อยืนยันการจองภายใน 1 ชั่วโมง
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {canShareToLine() && (
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="btn-elegant w-full gap-2"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังแชร์...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      แชร์ไปยัง Line Chat
                    </>
                  )}
                </Button>
              )}

              <Link href="/reservations" className="block">
                <Button variant="outline" className="w-full">
                  ดูการจองของฉัน
                </Button>
              </Link>

              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  กลับไปหน้าแรก
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Booking Form
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <Link href="/menu">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              กลับ
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">จองโต๊ะ</h1>
          {/* User Profile */}
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              {lineProfile?.pictureUrl && (
                <AvatarImage src={lineProfile.pictureUrl} alt={lineProfile.displayName} />
              )}
              <AvatarFallback>
                {lineProfile?.displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {lineProfile?.displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="card-elegant">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Branch Selection */}
              <div>
                <Label htmlFor="branch" className="text-foreground font-semibold">
                  เลือกสาขา *
                </Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch: value })
                  }
                >
                  <SelectTrigger className="input-elegant mt-2">
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="date" className="text-foreground font-semibold">
                  วันที่ที่ต้องการจอง *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="input-elegant mt-2"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <Label htmlFor="time" className="text-foreground font-semibold">
                  เวลาที่ต้องการจอง *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="input-elegant mt-2"
                  required
                />
              </div>

              {/* Number of Guests */}
              <div>
                <Label
                  htmlFor="guests"
                  className="text-foreground font-semibold"
                >
                  จำนวนคน *
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guests: parseInt(e.target.value),
                    })
                  }
                  className="input-elegant mt-2"
                  required
                />
              </div>

              {/* Special Notes */}
              <div>
                <Label
                  htmlFor="notes"
                  className="text-foreground font-semibold"
                >
                  หมายเหตุพิเศษ (ไม่บังคับ)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="เช่น มีคนแพ้อาหาร, ต้องการโต๊ะพิเศษ ฯลฯ"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input-elegant mt-2 resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createReservation.isPending}
                className="btn-elegant w-full"
              >
                {createReservation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    กำลังจอง...
                  </>
                ) : (
                  "ยืนยันการจอง"
                )}
              </Button>
            </form>
          </Card>

          {/* Info */}
          <Card className="card-elegant mt-6 bg-accent/5 border-accent/20">
            <h3 className="font-semibold text-foreground mb-2">ข้อมูลสำคัญ</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• เวลาจองสามารถเปลี่ยนแปลงได้ตามความพร้อมของร้าน</li>
              <li>• เราจะติดต่อคุณเพื่อยืนยันการจองภายใน 1 ชั่วโมง</li>
              <li>• หากต้องการยกเลิก กรุณาแจ้งให้ทราบ 24 ชั่วโมงก่อน</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
