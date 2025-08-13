import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Filter, Printer, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { warehouseApi, reportsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function DispensingReports() {
  const [selectedFacility, setSelectedFacility] = useState('جميع المنشآت');
  const [dispensingData, setDispensingData] = useState([]);
  const [dispensingOperations, setDispensingOperations] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filter data based on selected facility
  const filteredData = selectedFacility === 'جميع المنشآت' 
    ? dispensingOperations 
    : dispensingOperations.filter(item => item.facility === selectedFacility);

  const filteredChartData = selectedFacility === 'جميع المنشآت' 
    ? dashboardData?.chartData || [] 
    : dashboardData?.chartData?.filter((item) => item.facility === selectedFacility) || [];

  const filteredFacilityData = selectedFacility === 'جميع المنشآت' 
    ? dashboardData?.facilityData || [] 
    : dashboardData?.facilityData?.filter((item) => item.name === selectedFacility) || [];

  const filteredTrendData = selectedFacility === 'جميع المنشآت' 
    ? dashboardData?.trendData || [] 
    : dashboardData?.trendData?.filter((item) => item.facility === selectedFacility) || [];

  const totalDispensingValue = filteredData.reduce((sum, item) => sum + (item.totalValue || item.total_value || 0), 0);
  const totalItems = filteredData.reduce((sum, item) => sum + (item.items || item.items_count || 0), 0);
  const avgPerDispensing = totalDispensingValue / filteredData.length || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dispensingResponse, operationsResponse, facilitiesResponse] = await Promise.all([
          warehouseApi.getDispensingData(),
          warehouseApi.getDispensingOperations(),
          reportsApi.getFacilities()
        ]);

        if (dispensingResponse.success) {
          setDispensingData(dispensingResponse.data);
          setDashboardData(dispensingResponse.data);
        }

        if (operationsResponse.success) {
          setDispensingOperations(operationsResponse.data);
        }

        if (facilitiesResponse.success) {
          setFacilities([{ id: 'all', name: 'جميع المنشآت' }, ...facilitiesResponse.data]);
        }
      } catch (error) {
        console.error('Error fetching dispensing data:', error);
        toast({
          title: "خطأ",
          description: error.message || "فشل في تحميل بيانات تقارير الصرف",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handlePrintDetailed = (item) => {
    const currentDate = new Date().toLocaleDateString('ar-SA');
    const currentTime = new Date().toLocaleTimeString('ar-SA');
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير صرف مفصل - ${item.id}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            direction: rtl;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header h2 {
            color: #64748b;
            margin: 5px 0 0 0;
            font-size: 18px;
            font-weight: normal;
          }
          .info-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
          }
          .info-title {
            color: #1e293b;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #cbd5e1;
          }
          .info-label {
            font-weight: bold;
            color: #475569;
          }
          .info-value {
            color: #1e293b;
            font-weight: 600;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
          }
          .status-completed {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
          }
          .status-pending {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .signature-section {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
          }
          .signature-box {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            min-height: 80px;
          }
          .signature-title {
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
          }
          .signature-line {
            border-top: 1px solid #64748b;
            margin-top: 30px;
            padding-top: 5px;
            font-size: 12px;
            color: #64748b;
          }
          @media print {
            body { margin: 0; }
            .info-grid { grid-template-columns: 1fr; }
            .signature-section { grid-template-columns: 1fr; gap: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير صرف مفصل</h1>
          <h2>أمر الصرف رقم: ${item.id}</h2>
        </div>

        <div class="info-section">
          <div class="info-title">📋 بيانات أمر الصرف</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">رقم أمر الصرف:</span>
              <span class="info-value">${item.id}</span>
            </div>
            <div class="info-item">
              <span class="info-label">تاريخ الصرف:</span>
              <span class="info-value">${item.date || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">تاريخ الإنشاء:</span>
              <span class="info-value">${new Date(item.created_at).toLocaleDateString('ar-SA')}</span>
            </div>
            <div class="info-item">
              <span class="info-label">حالة الطلب:</span>
              <span class="info-value">
                <span class="status-badge ${item.status === 'مكتمل' ? 'status-completed' : 'status-pending'}">
                  ${item.status}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">🏢 بيانات الجهة المستفيدة</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">اسم المنشأة:</span>
              <span class="info-value">${item.facility || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">اسم المستلم:</span>
              <span class="info-value">${item.requested_by || item.requestedBy || 'غير محدد'}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">📦 تفاصيل الأصناف المصروفة</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">اسم الصنف:</span>
              <span class="info-value">${item.itemName || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">رقم الصنف:</span>
              <span class="info-value">${item.itemNumber || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">فئة الصنف:</span>
              <span class="info-value">${item.category || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">عدد الأصناف:</span>
              <span class="info-value">${item.items || item.items_count || 0}</span>
            </div>
            <div class="info-item">
              <span class="info-label">القيمة الإجمالية:</span>
              <span class="info-value">${(item.totalValue || item.total_value || 0).toLocaleString()} ريال سعودي</span>
            </div>
          </div>
        </div>

        ${item.notes ? `
        <div class="info-section">
          <div class="info-title">📝 ملاحظات</div>
          <div class="info-item">
            <span class="info-value">${item.notes}</span>
          </div>
        </div>
        ` : ''}

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-title">مسؤول المستودع</div>
            <div class="signature-line">التوقيع</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">المستلم</div>
            <div class="signature-line">التوقيع</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">المشرف</div>
            <div class="signature-line">التوقيع</div>
          </div>
        </div>

        <div class="footer">
          <p>تم إنشاء هذا التقرير بتاريخ: ${currentDate} الساعة: ${currentTime}</p>
          <p>نظام إدارة المستودعات الطبية</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-4 sm:p-6 text-primary-foreground shadow-lg print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-right">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">تقارير الصرف</h1>
            <p className="text-primary-foreground/90 text-sm sm:text-base">عرض وإدارة تقارير عمليات الصرف للمنشآت</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-right flex items-center gap-2 text-sm sm:text-base">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            فلترة التقارير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium mb-2 block text-right">الجهة المستفيدة/المنشأة</label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id || facility} value={facility.name || facility}>
                      {facility.name || facility}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <FileText className="w-4 h-4 ml-2" />
                تطبيق الفلتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-blue-100 text-xs sm:text-sm font-medium">إجمالي قيمة الصرف</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{totalDispensingValue.toLocaleString()}</p>
                <p className="text-xs text-blue-100">ريال</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-green-100 text-xs sm:text-sm font-medium">إجمالي الأصناف المصروفة</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{totalItems}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-purple-100 text-xs sm:text-sm font-medium">عدد عمليات الصرف</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{filteredData.length}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-orange-100 text-xs sm:text-sm font-medium">متوسط قيمة الصرف</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{avgPerDispensing.toFixed(0)}</p>
                <p className="text-xs text-orange-100">ريال</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">اتجاه الصرف الشهري</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip formatter={(value) => [`${value} ريال`, 'القيمة']} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">توزيع الصرف حسب المنشأة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredFacilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {filteredFacilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'النسبة']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">مقارنة الاتجاهات - الصرف مقابل الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="dispensing" stroke="hsl(var(--primary))" strokeWidth={2} name="عمليات الصرف" />
                <Line type="monotone" dataKey="requests" stroke="hsl(var(--secondary))" strokeWidth={2} name="الطلبات" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dispensing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">تفاصيل عمليات الصرف</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">رقم أمر الصرف</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">تاريخ الصرف</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">اسم المنشأة</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">اسم الصنف</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">الكمية</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">عدد الأصناف</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">القيمة الإجمالية</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">اسم المستلم</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">حالة الطلب</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">فئة الصنف</th>
                  <th className="text-right text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center p-4 border border-gray-200">
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center p-4 border border-gray-200">
                      لا توجد بيانات متاحة
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="font-medium text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2">{item.id}</td>
                      <td className="text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2">{item.date || new Date(item.created_at).toLocaleDateString('ar-SA')}</td>
                      <td className="text-xs sm:text-sm border border-gray-200 p-2">{item.facility}</td>
                      <td className="text-xs sm:text-sm border border-gray-200 p-2">{item.itemName || 'غير محدد'}</td>
                      <td className="text-xs sm:text-sm border border-gray-200 p-2">{item.itemNumber || 'غير محدد'}</td>
                      <td className="text-xs sm:text-sm border border-gray-200 p-2">{item.items || item.items_count}</td>
                      <td className="text-xs sm:text-sm whitespace-nowrap border border-gray-200 p-2">{(item.totalValue || item.total_value || 0).toLocaleString()} ريال</td>
                      <td className="text-xs sm:text-sm border border-gray-200 p-2">{item.requested_by || item.requestedBy || 'غير محدد'}</td>
                      <td className="border border-gray-200 p-2">
                        <Badge variant={item.status === 'مكتمل' ? 'default' : 'secondary'} className="text-xs whitespace-nowrap">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="text-xs sm:text-sm border border-gray-200 p-2">{item.category}</td>
                      <td className="border border-gray-200 p-2">
                        <Button 
                          onClick={() => handlePrintDetailed(item)} 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                        >
                          <Printer className="w-3 h-3 ml-1" />
                          طباعة مفصل
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
