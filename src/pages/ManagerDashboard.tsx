import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiCall } from '../lib/api';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { CheckCircle, XCircle, Clock, Calendar, Users, Bell } from 'lucide-react';
import clsx from 'clsx';

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'employees'>('pending');
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingTasks = async () => {
    setIsLoading(true);
    try {
      const response = await apiCall("task.getPending", { managerId: user?.employeeId, department: user?.department });
      if (response.success && response.data) {
        setTasks(response.data);
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
        setEmployees(response.data);
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

  return (
    <div className="space-y-6 relative">
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-full sm:w-fit mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('pending')}
          className={clsx(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all",
            activeTab === 'pending' ? "bg-white text-sky-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Bell className="w-5 h-5" />
          الطلبات المعلقة
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={clsx(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all",
            activeTab === 'employees' ? "bg-white text-sky-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Users className="w-5 h-5" />
          موظفو القسم
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {task.startDate}</div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {task.startTime}</div>
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
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
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
