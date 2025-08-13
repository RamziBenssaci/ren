import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, AlertTriangle, CheckCircle, XCircle, Clock, Building, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { warehouseApi, reportsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function WarehouseDashboard() {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filtered data based on user selections
  const filteredOrderStatusData = dashboardData?.orderStatusData || [
    { name: 'مفتوح', value: 12, color: '#3b82f6' },
    { name: 'مصروف', value: 145, color: '#10b981' },
    { name: 'مرفوض', value: 8, color: '#ef4444' }
  ];

  const filteredFacilitiesData = dashboardData?.facilitiesData?.filter((facility: any) => 
    !selectedFacility || facility.name === selectedFacility
  ) || [
    { name: 'مستشفى الملك فهد', items: 120 },
    { name: 'مركز الأورام', items: 89 },
    { name: 'مركز القلب', items: 76 },
    { name: 'مركز الأطفال', items: 65 },
    { name: 'العيادات الخارجية', items: 45 }
  ];

  const filteredSuppliers = topSuppliers.filter(supplier => 
    !selectedSupplier || supplier.name === selectedSupplier
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardResponse, suppliersResponse, facilitiesResponse] = await Promise.all([
          warehouseApi.getDashboardData(),
          warehouseApi.getTopSuppliers(),
          reportsApi.getFacilities()
        ]);

        if (dashboardResponse.success) {
          setDashboardData(dashboardResponse.data);
        }

        if (suppliersResponse.success) {
          setTopSuppliers(suppliersResponse.data);
        }

        if (facilitiesResponse.success) {
          setFacilities(facilitiesResponse.data);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "خطأ",
          description: error.message || "فشل في تحميل بيانات لوحة التحكم",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleFilter = () => {
    // Client-side filtering is already applied via filteredData variables
    console.log('Filtering by:', { selectedFacility, selectedItem, selectedSupplier });
  };

  const clearFilters = () => {
    setSelectedFacility('');
    setSelectedItem('');
    setSelectedSupplier('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold text-right">لوحة تحكم المستودع</h1>
        <p className="text-blue-100 mt-2 text-right">إدارة شاملة لمخزون المستودع والطلبات</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">فلاتر البحث</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المنشأة" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.name}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="رقم أو اسم الصنف"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            />

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الشركة الموردة" />
              </SelectTrigger>
              <SelectContent>
                {topSuppliers.map((supplier, index) => (
                  <SelectItem key={index} value={supplier.name}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={handleFilter} className="flex-1">
                تطبيق الفلتر
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                مسح
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">إجمالي الأصناف</p>
                <p className="text-2xl font-bold text-blue-800">{dashboardData?.totalItems || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-orange-600">المخزون المنخفض</p>
                <p className="text-2xl font-bold text-orange-800">{dashboardData?.lowStockItems || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">طلبات مصروفة</p>
                <p className="text-2xl font-bold text-green-800">{dashboardData?.orders?.completed || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">طلبات مفتوحة</p>
                <p className="text-2xl font-bold text-blue-800">{dashboardData?.orders?.open || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">توزيع حالة الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                 <Pie
                  data={filteredOrderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filteredOrderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Facilities Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">توزيع الأصناف حسب المنشآت</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredFacilitiesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="items" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">أكثر الشركات توريداً للأصناف</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-4">جاري تحميل البيانات...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuppliers.map((supplier, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-right">
                    <p className="font-medium">{supplier.name}</p>
                    <p className="text-sm text-gray-600">{supplier.items_supplied || supplier.itemsSupplied} صنف</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-blue-600">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}