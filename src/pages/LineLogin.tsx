import { useEffect, useState } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { useLocation } from "wouter";

export default function LineLogin() {
  const { isLineLoggedInStatus, lineProfile, isLoading: liffLoading, refreshLoginStatus } = useLiff();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [, setLocation] = useLocation();

  // If already logged in to LINE, redirect to home
  useEffect(() => {
    if (!liffLoading && isLineLoggedInStatus && lineProfile) {
      setLocation("/");
    }
  }, [isLineLoggedInStatus, lineProfile, liffLoading, setLocation]);

  const handleLineLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Use LIFF login
      if (window.liff) {
        // Call LINE login - this will redirect to LINE login page
        window.liff.login();
        
        // After login, the page will reload, so we refresh login status
        // This handles the case where user comes back from LINE login
        setTimeout(async () => {
          await refreshLoginStatus();
        }, 1000);
      } else {
        alert("ไม่สามารถเข้าสู่ระบบ LINE ได้ กรุณาเปิดแอปนี้จาก LINE");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (liffLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto mb-4"></div>
          <p className="text-amber-700">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-amber-200 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <UtensilsCrossed className="w-8 h-8 text-amber-900" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-amber-900">
            Choongman Chicken
          </CardTitle>
          <p className="text-sm text-amber-700 mt-2">
            จองโต๊ะร้านอาหารออนไลน์
          </p>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-amber-900">
                ยินดีต้อนรับ
              </h2>
              <p className="text-amber-700">
                เข้าสู่ระบบด้วย LINE เพื่อเริ่มจองโต๊ะ
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-amber-900 font-bold">✓</span>
                <span className="text-sm text-amber-900">
                  จองโต๊ะได้ง่ายและรวดเร็ว
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-900 font-bold">✓</span>
                <span className="text-sm text-amber-900">
                  ดูเมนูใหม่พิเศษ
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-900 font-bold">✓</span>
                <span className="text-sm text-amber-900">
                  รับการแจ้งเตือนก่อนการจอง
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-900 font-bold">✓</span>
                <span className="text-sm text-amber-900">
                  แชร์การจองกับเพื่อน
                </span>
              </div>
            </div>

            {/* LINE Login Button */}
            <Button
              onClick={handleLineLogin}
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-6 text-lg rounded-lg shadow-lg transition-all"
            >
              {isLoggingIn ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <span className="mr-2">💚</span>
                  เข้าสู่ระบบด้วย LINE
                </>
              )}
            </Button>

            {/* Info Text */}
            <p className="text-xs text-center text-amber-600">
              โปรดเปิดแอปนี้จาก LINE เพื่อเข้าสู่ระบบ
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
