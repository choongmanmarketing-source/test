import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Only administrators can access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();

  // Fetch reservations
  const { data: reservationsData, isLoading: reservationsLoading } =
    trpc.admin.reservations.useQuery({
      limit: 10,
      offset: currentPage * 10,
    });

  // Fetch chart data
  const { data: chartData } = trpc.admin.chartData.useQuery();

  // Search reservations
  const { data: searchResults } = trpc.admin.search.useQuery(
    { query: searchQuery, limit: 10, offset: 0 },
    { enabled: searchQuery.length > 0 }
  );

  // Update status mutation
  const updateStatusMutation = trpc.admin.updateReservationStatus.useMutation({
    onSuccess: () => {
      toast.success("สถานะการจองอัปเดตสำเร็จ");
      // Refetch reservations
      reservationsData && window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const displayReservations = searchQuery ? searchResults : reservationsData?.reservations;
  const totalReservations = reservationsData?.total || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "รอการยืนยัน";
      case "confirmed":
        return "ยืนยันแล้ว";
      case "completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            📊 Admin Dashboard
          </h1>
          <p className="text-amber-700">
            ยินดีต้อนรับ {user?.name} - จัดการการจองทั้งหมด
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-amber-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
              <CardTitle className="text-amber-900">📅 วันนี้</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ทั้งหมด:</span>
                  <span className="font-bold text-xl text-amber-900">
                    {stats?.totalToday || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ยืนยันแล้ว:</span>
                  <span className="font-bold text-green-600">
                    {stats?.confirmedToday || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">รอการยืนยัน:</span>
                  <span className="font-bold text-yellow-600">
                    {stats?.pendingToday || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
              <CardTitle className="text-amber-900">📈 สัปดาห์นี้</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-amber-900 mb-2">
                {stats?.totalThisWeek || 0}
              </div>
              <p className="text-sm text-gray-600">การจองทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
              <CardTitle className="text-amber-900">📊 เดือนนี้</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ทั้งหมด:</span>
                  <span className="font-bold text-xl text-amber-900">
                    {stats?.totalThisMonth || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เสร็จสิ้น:</span>
                  <span className="font-bold text-blue-600">
                    {stats?.completedThisMonth || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData && chartData.length > 0 && (
          <Card className="border-2 border-amber-200 bg-white shadow-lg mb-8">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
              <CardTitle className="text-amber-900">
                📈 แนวโน้มการจอง (30 วันที่ผ่านมา)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#D4A574"
                    strokeWidth={2}
                    name="จำนวนการจอง"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="border-2 border-amber-200 bg-white shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
            <CardTitle className="text-amber-900">🔍 ค้นหาและกรอง</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="ค้นหาชื่อหรืออีเมล..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="กรองตามสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="pending">รอการยืนยัน</SelectItem>
                  <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reservations Table */}
        <Card className="border-2 border-amber-200 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
            <CardTitle className="text-amber-900">
              📋 รายการการจอง ({totalReservations})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {reservationsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">กำลังโหลด...</p>
              </div>
            ) : displayReservations && displayReservations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-amber-50 border-b-2 border-amber-200">
                      <TableHead className="text-amber-900 font-bold">
                        ชื่อผู้จอง
                      </TableHead>
                      <TableHead className="text-amber-900 font-bold">
                        อีเมล
                      </TableHead>
                      <TableHead className="text-amber-900 font-bold">
                        วันที่ - เวลา
                      </TableHead>
                      <TableHead className="text-amber-900 font-bold">
                        จำนวนคน
                      </TableHead>
                      <TableHead className="text-amber-900 font-bold">
                        สถานะ
                      </TableHead>
                      <TableHead className="text-amber-900 font-bold">
                        การจัดการ
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayReservations.map((reservation) => (
                      <TableRow key={reservation.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <TableCell className="font-medium">
                          {reservation.userName || "ไม่ระบุ"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {reservation.userEmail || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(
                            new Date(reservation.reservationDate),
                            "dd MMM yyyy",
                            { locale: th }
                          )}{" "}
                          - {reservation.reservationTime}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {reservation.numberOfGuests}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              reservation.status
                            )}`}
                          >
                            {getStatusLabel(reservation.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={reservation.status}
                            onValueChange={(newStatus) => {
                              updateStatusMutation.mutate({
                                id: reservation.id,
                                status: newStatus as any,
                              });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                รอการยืนยัน
                              </SelectItem>
                              <SelectItem value="confirmed">
                                ยืนยันแล้ว
                              </SelectItem>
                              <SelectItem value="completed">
                                เสร็จสิ้น
                              </SelectItem>
                              <SelectItem value="cancelled">ยกเลิก</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">ไม่พบการจอง</p>
              </div>
            )}

            {/* Pagination */}
            {!searchQuery && totalReservations > 10 && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-amber-200">
                <Button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  variant="outline"
                >
                  ← ก่อนหน้า
                </Button>
                <span className="text-sm text-gray-600">
                  หน้า {currentPage + 1} จาก{" "}
                  {Math.ceil(totalReservations / 10)}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(totalReservations / 10) - 1,
                        currentPage + 1
                      )
                    )
                  }
                  disabled={currentPage >= Math.ceil(totalReservations / 10) - 1}
                  variant="outline"
                >
                  ถัดไป →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
