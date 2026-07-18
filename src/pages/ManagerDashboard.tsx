import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiCall } from '../lib/api';
import { formatDate, formatTime } from '../lib/format';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { CheckCircle, XCircle, Clock, Calendar, Users, Printer, Search } from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const location = useLocation();
  const activeTab: 'pending' | 'employees' | 'report' =
    location.pathname === '/manager/employees' ? 'employees' :
    location.pathname === '/manager/report' ? 'report' : 'pending';

  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ===== حالة تبويب التقارير والطباعة =====
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reportEmployeeId, setReportEmployeeId] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [reportTasks, setReportTasks] = useState<any[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportSearched, setReportSearched] = useState(false);

  const fetchPendingTasks = async () => {
    setIsLoading(true);
    try {
      const response = await apiCall("task.getPending", { managerId: user?.employeeId, department: user?.department });
      if (response.success && response.data) {
        setTasks(response.data as any[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await apiCall("employee.getByDepartment", { department: user?.department });
      if (response.success && response.data) {
        setEmployees(response.data as any[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') fetchPendingTasks();
    if (activeTab === 'employees') fetchDepartmentEmployees();
    if (activeTab === 'report' && employees.length === 0) fetchDepartmentEmployees();
  }, [activeTab]);

  const handleApprove = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من اعتماد هذا الطلب؟')) return;
    setIsProcessing(true);
    try {
      const response = await apiCall("approval.approve", {
        taskId,
        managerName: user?.fullName,
        comment: "معتمد"
      });
      if (response.success) {
        toast.success('تم اعتماد الطلب بنجاح');
        setTasks(tasks.filter(t => t.taskId !== taskId));
      } else {
        toast.error(response.message || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectComment.trim()) {
      toast.error('يجب كتابة سبب الرفض');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiCall("approval.reject", {
        taskId: selectedTaskId,
        managerName: user?.fullName,
        comment: rejectComment
      });
      if (response.success) {
        toast.success('تم رفض الطلب');
        setTasks(tasks.filter(t => t.taskId !== selectedTaskId));
        setRejectModalOpen(false);
        setRejectComment('');
      } else {
        toast.error(response.message || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setRejectComment('');
    setRejectModalOpen(true);
  };

  // ===== منطق تبويب التقارير =====
  const fetchReport = async () => {
    setIsReportLoading(true);
    setReportSearched(true);
    try {
      // ملاحظة: يتطلب هذا الإجراء دعماً من الخادم الخلفي (Google Apps Script)
      // باسم "task.getDepartmentReport" يعيد كل مهام القسم (وليس المعلقة فقط)
      // مع إمكانية التصفية حسب التاريخ/الموظف/الحالة.
      const response = await apiCall("task.getDepartmentReport", {
        department: user?.department,
        from: reportFrom || undefined,
        to: reportTo || undefined,
        employeeId: reportEmployeeId || undefined,
        status: reportStatus || undefined,
      });
      if (response.success && response.data) {
        setReportTasks(response.data as any[]);
      } else {
        toast.error(response.message || 'تعذر جلب بيانات التقرير');
        setReportTasks([]);
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setIsReportLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 relative">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:hidden">
        {activeTab === 'pending' && (
          <>
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">الطلبات المعلقة للاعتماد</h2>
              <button onClick={fetchPendingTasks} className="text-sm text-sky-600 hover:underline">تحديث</button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-sky-600" /></div>
            ) : tasks.length === 0 ? (
               <div className="text-center py-12 text-slate-500">لا توجد طلبات معلقة حالياً.</div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-sm transition-shadow">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                          {task.taskType}
                        </span>
                        <h3 className="font-bold text-slate-800">{task.employeeName}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{task.description}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(task.startDate)}</div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(task.startTime)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                      <button
                        onClick={() => handleApprove(task.taskId)}
                        disabled={isProcessing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        اعتماد
                      </button>
                      <button
                        onClick={() => openRejectModal(task.taskId)}
                        disabled={isProcessing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        رفض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'employees' && (
          <>
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">موظفو القسم</h2>
              <button onClick={fetchDepartmentEmployees} className="text-sm text-sky-600 hover:underline">تحديث</button>
            </div>

            {isLoading ? (
               <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-sky-600" /></div>
            ) : employees.length === 0 ? (
               <div className="text-center py-12 text-slate-500">لا يوجد موظفين في هذا القسم.</div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {employees.map((emp, i) => (
                   <div key={i} className="border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
                     <div className="bg-slate-100 p-3 rounded-full text-slate-500">
                       <Users className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-800">{emp.fullName}</h3>
                       <p className="text-sm text-slate-500">{emp.jobTitle}</p>
                       <p className="text-xs text-slate-400 mt-1">{emp.email}</p>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </>
        )}

        {activeTab === 'report' && (
          <>
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">التقارير والطباعة</h2>
            </div>

            {/* عوامل التصفية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">من تاريخ</label>
                <input type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">إلى تاريخ</label>
                <input type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الموظف</label>
                <select value={reportEmployeeId} onChange={(e) => setReportEmployeeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500">
                  <option value="">جميع الموظفين</option>
                  {employees.map((emp, i) => (
                    <option key={i} value={emp.employeeId}>{emp.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500">
                  <option value="">جميع الحالات</option>
                  <option value="بانتظار الاعتماد">بانتظار الاعتماد</option>
                  <option value="معتمد">معتمد</option>
                  <option value="مرفوض">مرفوض</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={fetchReport} disabled={isReportLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors">
                {isReportLoading ? <Spinner /> : <Search className="w-5 h-5" />}
                بحث
              </button>
              {reportTasks.length > 0 && (
                <>
                  <button onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors">
                    <Printer className="w-5 h-5" />
                    طباعة
                  </button>
                  <button onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                    تنزيل PDF
                  </button>
                </>
              )}
            </div>

            {isReportLoading ? (
              <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-sky-600" /></div>
            ) : reportSearched && reportTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">لا توجد نتائج مطابقة لعوامل التصفية.</div>
            ) : !reportSearched ? (
              <div className="text-center py-12 text-slate-400">اختر عوامل التصفية ثم اضغط "بحث" لعرض النتائج.</div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">الموظف</th>
                      <th className="px-4 py-3 font-semibold">نوع المهمة</th>
                      <th className="px-4 py-3 font-semibold">التاريخ</th>
                      <th className="px-4 py-3 font-semibold">الوقت</th>
                      <th className="px-4 py-3 font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportTasks.map((t, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">{t.employeeName}</td>
                        <td className="px-4 py-3">{t.taskType}</td>
                        <td className="px-4 py-3">{formatDate(t.startDate)} - {formatDate(t.endDate)}</td>
                        <td className="px-4 py-3">{formatTime(t.startTime)} - {formatTime(t.endTime)}</td>
                        <td className="px-4 py-3">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== منطقة الطباعة فقط (مخفية على الشاشة، تظهر عند الطباعة) ===== */}
      {activeTab === 'report' && reportTasks.length > 0 && (
        <div className="hidden print:block">
          <div className="flex items-center gap-4 border-b-2 border-sky-700 pb-4 mb-6">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="شعار" className="w-16 h-16 object-contain" />
            <div>
              <p className="text-sm text-slate-500">سلطنة عمان - وزارة التعليم</p>
              <h1 className="text-lg font-bold text-slate-800">مركز التدريب - تقرير خطط العمل</h1>
              <p className="text-xs text-slate-400">تاريخ إصدار التقرير: {today}</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 mb-4 flex flex-wrap gap-4">
            {reportFrom && <span>من: {formatDate(reportFrom)}</span>}
            {reportTo && <span>إلى: {formatDate(reportTo)}</span>}
            {reportEmployeeId && <span>الموظف: {employees.find(e => e.employeeId === reportEmployeeId)?.fullName || ''}</span>}
            {reportStatus && <span>الحالة: {reportStatus}</span>}
            <span>القسم: {user?.department}</span>
          </div>

          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-2 py-2">م</th>
                <th className="border border-slate-300 px-2 py-2">الموظف</th>
                <th className="border border-slate-300 px-2 py-2">نوع المهمة</th>
                <th className="border border-slate-300 px-2 py-2">التاريخ</th>
                <th className="border border-slate-300 px-2 py-2">الوقت</th>
                <th className="border border-slate-300 px-2 py-2">مقر التنفيذ</th>
                <th className="border border-slate-300 px-2 py-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {reportTasks.map((t, i) => (
                <tr key={i}>
                  <td className="border border-slate-300 px-2 py-2 text-center">{i + 1}</td>
                  <td className="border border-slate-300 px-2 py-2">{t.employeeName}</td>
                  <td className="border border-slate-300 px-2 py-2">{t.taskType}</td>
                  <td className="border border-slate-300 px-2 py-2">{formatDate(t.startDate)} - {formatDate(t.endDate)}</td>
                  <td className="border border-slate-300 px-2 py-2">{formatTime(t.startTime)} - {formatTime(t.endTime)}</td>
                  <td className="border border-slate-300 px-2 py-2">{t.location}</td>
                  <td className="border border-slate-300 px-2 py-2">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[10px] text-slate-400 mt-8 text-center">تم إصدار هذا التقرير آلياً من نظام إدارة خطط عمل مركز التدريب - وزارة التعليم</p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">رفض الطلب</h3>
            <form onSubmit={handleReject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">سبب الرفض (إلزامي)</label>
                <textarea
                  rows={4}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  placeholder="اكتب سبب الرفض هنا..."
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  إلغاء
                </button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  {isProcessing ? <Spinner /> : 'تأكيد الرفض'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
