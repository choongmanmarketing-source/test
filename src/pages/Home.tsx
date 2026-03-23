import { useLiff } from "@/contexts/LiffContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  CheckCircle,
  Share2,
  Loader2,
  BookOpen,
  History,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { shareReservationToLine, canShareToLine } from "@/lib/lineShare";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663454832330/L8vvkFLDGukGmSeoWEePDY/hero-chicken_a9829e6d.jpg";
const MENU_IMAGES = {
  spicy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663454832330/L8vvkFLDGukGmSeoWEePDY/menu-chicken-spicy_76c4a1ab.webp",
  crispy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663454832330/L8vvkFLDGukGmSeoWEePDY/menu-chicken-crispy_df57c92d.jpg",
  garlic: "https://d2xsxph8kpxj0f.cloudfront.net/310519663454832330/L8vvkFLDGukGmSeoWEePDY/menu-chicken-garlic_b6675ba0.jpg",
};

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

const MENU_ITEMS = [
  {
    id: 1,
    name: "ไก่ทอดซอสเผ็ดเกาหลี",
    description: "ไก่ทอดกรอบราดซอสโกชูจัง รสเผ็ดหวาน",
    price: 259,
    image: MENU_IMAGES.spicy,
    tag: "ยอดนิยม",
  },
  {
    id: 2,
    name: "ไก่ทอดกรอบออริจินัล",
    description: "ไก่ทอดสูตรดั้งเดิม กรอบนอกนุ่มใน",
    price: 229,
    image: MENU_IMAGES.crispy,
    tag: "แนะนำ",
  },
  {
    id: 3,
    name: "ไก่ทอดซอสกระเทียม",
    description: "ไก่ทอดราดซอสกระเทียมเข้มข้น โรยพริก",
    price: 279,
    image: MENU_IMAGES.garlic,
    tag: "ใหม่",
  },
];

interface ConfirmationData {
  id: number;
  date: Date;
  time: string;
  guests: number;
  notes?: string;
  branch: string;
}

export default function Home() {
  const { isLineLoggedInStatus, lineProfile, isLoading } = useLiff();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    branch: "",
    date: "",
    time: "19:00",
    guests: 2,
    notes: "",
  });
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [step, setStep] = useState(1); // 1: branch/date, 2: details, 3: confirm

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
      setStep(3);
      toast.success("จองโต๊ะสำเร็จ!");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการจอง");
    },
  });

  // Redirect to LINE login if not authenticated
  useEffect(() => {
    if (!isLoading && !isLineLoggedInStatus) {
      setLocation("/line-login");
    }
  }, [isLoading, isLineLoggedInStatus, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isLineLoggedInStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.branch) {
        toast.error("กรุณาเลือกสาขา");
        return;
      }
      if (!formData.date) {
        toast.error("กรุณาเลือกวันที่");
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = () => {
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
        toast.success("แชร์การจองไปยัง LINE สำเร็จ!");
      } else {
        toast.error("ไม่สามารถแชร์ได้ กรุณาลองใหม่");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการแชร์");
    } finally {
      setIsSharing(false);
    }
  };

  const resetForm = () => {
    setFormData({ branch: "", date: "", time: "19:00", guests: 2, notes: "" });
    setConfirmationData(null);
    setStep(1);
  };

  // ===== CONFIRMATION SCREEN =====
  if (step === 3 && confirmationData) {
    const dateStr = format(confirmationData.date, "d MMMM yyyy", { locale: th });
    const branchName = BRANCHES.find((b) => b.id === confirmationData.branch)?.name;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header lineProfile={lineProfile} />

        <div className="container py-8">
          <div className="max-w-lg mx-auto">
            {/* Success Animation */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                จองสำเร็จ!
              </h2>
              <p className="text-muted-foreground text-sm">
                เราจะติดต่อยืนยันภายใน 1 ชั่วโมง
              </p>
            </div>

            {/* Booking Summary Card */}
            <Card className="glass-card p-6 mb-6">
              <div className="text-center mb-4">
                <span className="text-xs text-muted-foreground">หมายเลขการจอง</span>
                <p className="text-3xl font-bold text-accent">#{confirmationData.id}</p>
              </div>

              <div className="divide-y divide-border">
                <div className="flex items-center gap-3 py-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">สาขา</p>
                    <p className="font-semibold text-foreground">{branchName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">วันที่</p>
                    <p className="font-semibold text-foreground">{dateStr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">เวลา</p>
                    <p className="font-semibold text-foreground">{confirmationData.time} น.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <Users className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">จำนวน</p>
                    <p className="font-semibold text-foreground">{confirmationData.guests} ท่าน</p>
                  </div>
                </div>
                {confirmationData.notes && (
                  <div className="py-3">
                    <p className="text-xs text-muted-foreground mb-1">หมายเหตุ</p>
                    <p className="text-sm text-foreground">{confirmationData.notes}</p>
                  </div>
                )}
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
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  แชร์ไปยัง LINE
                </Button>
              )}
              <Button onClick={resetForm} variant="outline" className="w-full rounded-xl">
                จองโต๊ะอีกครั้ง
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <BottomNav />
      </div>
    );
  }

  // ===== MAIN PAGE =====
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <Header lineProfile={lineProfile} />

      {/* Hero Banner */}
      <section className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Choongman Chicken"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg">
            Choongman Chicken
          </h2>
          <p className="text-white/80 text-sm mt-1">
            ไก่ทอดเกาหลีสูตรพิเศษ กรอบนอกนุ่มใน
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="container mt-4 relative z-10">
        <Card className="glass-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <h3 className="text-lg font-bold text-foreground">{t("home.booking_title")}</h3>
            </div>

          {step === 1 ? (
            <div className="space-y-4">
              {/* Branch */}
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">
                  <MapPin className="w-4 h-4 inline mr-1 text-accent" />
                  เลือกสาขา
                </Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => setFormData({ ...formData, branch: value })}
                >
                  <SelectTrigger className="input-elegant">
                    <SelectValue placeholder="เลือกสาขาที่ต้องการ" />
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

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-1.5 block">
                    <Calendar className="w-4 h-4 inline mr-1 text-accent" />
                    วันที่
                  </Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-elegant"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-1.5 block">
                    <Clock className="w-4 h-4 inline mr-1 text-accent" />
                    เวลา
                  </Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-elegant"
                  />
                </div>
              </div>

              {/* Guests */}
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">
                  <Users className="w-4 h-4 inline mr-1 text-accent" />
                  จำนวนคน
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0 text-lg"
                    onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold text-foreground w-12 text-center">
                    {formData.guests}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0 text-lg"
                    onClick={() => setFormData({ ...formData, guests: Math.min(20, formData.guests + 1) })}
                  >
                    +
                  </Button>
                  <span className="text-sm text-muted-foreground">ท่าน</span>
                </div>
              </div>

              <Button onClick={handleNext} className="btn-elegant w-full gap-2 mt-2">
                ถัดไป
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-4">
              {/* Summary of step 1 */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">สาขา</span>
                  <span className="font-semibold text-foreground">
                    {BRANCHES.find((b) => b.id === formData.branch)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">วันที่</span>
                  <span className="font-semibold text-foreground">
                    {formData.date ? format(new Date(formData.date), "d MMM yyyy", { locale: th }) : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">เวลา / จำนวน</span>
                  <span className="font-semibold text-foreground">
                    {formData.time} น. / {formData.guests} ท่าน
                  </span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-accent text-xs font-semibold hover:underline mt-1"
                >
                  แก้ไข
                </button>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">
                  หมายเหตุพิเศษ (ไม่บังคับ)
                </Label>
                <Textarea
                  placeholder="เช่น แพ้อาหาร, ต้องการโต๊ะพิเศษ, วันเกิด ฯลฯ"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-elegant resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  ย้อนกลับ
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createReservation.isPending}
                  className="btn-elegant flex-1 gap-2"
                >
                  {createReservation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  ยืนยันจอง
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      {/* Popular Menu Section */}
      <section className="container mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">เมนูยอดนิยม</h3>
          <Link href="/menu" className="text-accent text-sm font-semibold flex items-center gap-1 hover:underline">
            ดูทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
          {MENU_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-44 snap-start"
            >
              <div className="relative rounded-xl overflow-hidden mb-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-44 h-44 object-cover"
                />
                <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground leading-tight mb-0.5">
                {item.name}
              </h4>
              <p className="text-xs text-muted-foreground leading-tight mb-1">
                {item.description}
              </p>
              <p className="text-sm font-bold text-accent">฿{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Info */}
      <section className="container mt-8">
        <Card className="bg-accent/5 border-accent/15 p-4 rounded-xl">
          <p className="text-sm text-foreground font-semibold mb-2">
            ข้อมูลสำคัญ
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">&#x2022;</span>
              เราจะติดต่อยืนยันการจองภายใน 1 ชั่วโมง
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">&#x2022;</span>
              หากต้องการยกเลิก กรุณาแจ้ง 24 ชั่วโมงก่อน
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">&#x2022;</span>
              เปิดให้บริการ 11:00 - 22:00 น. ทุกวัน
            </li>
          </ul>
        </Card>
      </section>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}

// ===== HEADER COMPONENT =====
function Header({ lineProfile }: { lineProfile: any }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-foreground text-base">Choongman</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {lineProfile && (
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {lineProfile.displayName}
              </span>
              <Avatar className="h-8 w-8">
                {lineProfile.pictureUrl && (
                  <AvatarImage src={lineProfile.pictureUrl} alt={lineProfile.displayName} />
                )}
                <AvatarFallback className="text-xs">
                  {lineProfile.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// ===== BOTTOM NAV COMPONENT =====
function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border/50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="container flex items-center justify-around h-16 max-w-lg mx-auto">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-accent">
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold">จองโต๊ะ</span>
        </Link>
        <Link href="/menu" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-accent transition-colors">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">เมนู</span>
        </Link>
        <Link href="/reservations" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-accent transition-colors">
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">การจอง</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-accent transition-colors">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">โปรไฟล์</span>
        </Link>
      </div>
    </nav>
  );
}
