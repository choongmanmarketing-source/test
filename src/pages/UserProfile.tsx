import { useLiff } from "@/contexts/LiffContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { ArrowLeft, LogOut, Calendar } from "lucide-react";
import { logoutFromLine } from "@/lib/liff";
import { trpc } from "@/lib/trpc";

export default function UserProfile() {
  const { isLineLoggedInStatus, lineProfile, isLoading } = useLiff();
  const [, setLocation] = useLocation();
  const { data: reservations } = trpc.reservations.list.useQuery(undefined, {
    enabled: isLineLoggedInStatus,
  });

  const handleLogout = () => {
    logoutFromLine();
    setLocation("/line-login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isLineLoggedInStatus || !lineProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-muted-foreground mb-6">
            คุณต้องเข้าสู่ระบบเพื่อดูโปรไฟล์
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
          <h1 className="text-2xl font-bold text-foreground">โปรไฟล์ของฉัน</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Card */}
          <Card className="card-elegant">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24">
                  {lineProfile.pictureUrl && (
                    <AvatarImage
                      src={lineProfile.pictureUrl}
                      alt={lineProfile.displayName}
                    />
                  )}
                  <AvatarFallback className="text-2xl">
                    {lineProfile.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {lineProfile.displayName}
                </h2>
                <p className="text-muted-foreground mb-4">
                  LINE ID: {lineProfile.userId}
                </p>
                {lineProfile.statusMessage && (
                  <p className="text-sm text-muted-foreground italic">
                    "{lineProfile.statusMessage}"
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Reservations Summary */}
          <Card className="card-elegant">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold text-foreground">
                การจองของฉัน
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">
                  ทั้งหมด
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {reservations?.length || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700 mb-1">
                  รอการยืนยัน
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {reservations?.filter((r) => r.status === "pending").length || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 mb-1">
                  ยืนยันแล้ว
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {reservations?.filter((r) => r.status === "confirmed").length || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">
                  เสร็จสิ้น
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {reservations?.filter((r) => r.status === "completed").length || 0}
                </p>
              </div>
            </div>

            <Link href="/reservations" className="block">
              <Button className="btn-elegant w-full">
                ดูรายละเอียดการจองทั้งหมด
              </Button>
            </Link>
          </Card>

          {/* Quick Actions */}
          <Card className="card-elegant">
            <h3 className="text-xl font-bold text-foreground mb-4">
              การกระทำอื่น ๆ
            </h3>
            <div className="space-y-3">
              <Link href="/menu" className="block">
                <Button variant="outline" className="w-full justify-start">
                  ดูเมนูและจองโต๊ะใหม่
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
