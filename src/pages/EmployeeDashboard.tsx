import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiCall } from '../lib/api';
import { formatDate, formatTime, todayDateString } from '../lib/format';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { Clock, MapPin, Calendar, Pencil, Trash2, X } from 'lucide-react';
import clsx from 'clsx';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab: 'add' | 'list' = location.pathname === '/employee/add' ? 'add' : 'list';

  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // بيانات النموذج (تُستخدم للإضافة وللتعديل معاً)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState('');
  const [otherTaskDetails, setOtherTaskDetails] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location_, setLocationField] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const today = todayDateString();

  const fetchTasks = async () => {
    if (!user) return;
    setIsLoadingTasks(true);
    try {
      const response = await apiCall("task.getByEmployee", { employeeId: user.employeeId });
      if (response.success && response.data) {
        setTasks(response.data as any[]);
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب المهام');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchTasks();
    }
  }, [activeTab]);

  const resetForm = () => {
    setEditingTaskId(null);
    setTaskType(''); setOtherTaskDetails(''); setStartDate(''); setEndDate('');
    setStartTime(''); setEndTime(''); setLocationField(''); setDescription('');
  };

  const startEdit = (task: any) => {
    setEditingTaskId(task.taskId);
    // يفصل "أخرى: التفاصيل" إلى القيمتين المنفصلتين في النموذج إن وُجدت
    if (typeof task.taskType === 'string' && task.taskType.startsWith('أخرى:')) {
      setTaskType('أخرى');
      setOtherTaskDetails(task.taskType.replace('أخرى:', '').trim());
    } else {
      setTaskType(task.taskType || '');
      setOtherTaskDetails('');
    }
    setStartDate((task.startDate || '').split('T')[0]);
    setEndDate((task.endDate || '').split('T')[0]);
    setStartTime(task.startTime || '');
    setEndTime(task.endTime || '');
    setLocationField(task.location || '');
    setDescription(task.description || '');
    navigate('/employee/add');
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    setDeletingTaskId(taskId);
    try {
      const response = await apiCall("task.delete", { taskId, employeeId: user?.employeeId });
      if (response.success) {
        toast.success('تم حذف الخطة بنجاح');
        setTasks(tasks.filter(t => t.taskId !== taskId));
      } else {
        toast.error(response.message || 'تعذر حذف الخطة');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskType || !startDate || !endDate || !startTime || !endTime || !location_ || !description) {
      toast.error('الرجاء تعبئة جميع الحقول');
      return;
    }
    if (endDate < startDate) {
      toast.error('لا يمكن أن يكون تاريخ النهاية قبل تاريخ البداية');
      return;
    }

    setIsSubmitting(true);
    try {
      const taskPayload = {
        employeeId: user?.employeeId,
        employeeName: user?.fullName,
        taskType: taskType === 'أخرى' && otherTaskDetails ? `أخرى: ${otherTaskDetails}` : taskType,
        startDate, endDate, startTime, endTime,
        location: location_,
        description
      };

      const response = editingTaskId
        ? await apiCall("task.update", { task: { taskId: editingTaskId, ...taskPayload } })
        : await apiCall("task.add", { task: taskPayload });

      if (response.success) {
        toast.success(response.message || (editingTaskId ? 'تم تحديث الخطة بنجاح' : 'تمت إضافة خطة العمل بنجاح'));
        resetForm();
        navigate('/employee');
      } else {
        toast.error(response.message || 'حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusStyle = (status: string) => clsx(
    "text-xs font-bold px-2 py-1 rounded-full",
    status === 'بانتظار الاعتماد' ? "bg-amber-100 text-amber-800" :
    status === 'معتمد' ? "bg-emerald-100 text-emerald-800" :
    "bg-red-100 text-red-800"
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">{editingTaskId ? 'تعديل خطة العمل' : 'إضافة خطة عمل جديدة'}</h2>
              {editingTaskId && (
                <button
                  onClick={() => { resetForm(); }}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> إلغاء التعديل
                </button>
              )}
            </div>
            <form onSubmit={handleAddTask} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">نوع المهمة</label>
                <select
                  value={taskType} onChange={(e) => { setTaskType(e.target.value); setOtherTaskDetails(''); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">اختر نوع المهمة...</option>
                  <option value="تدريب داخلي">تدريب داخلي</option>
                  <option value="تدريب خارجي">تدريب خارجي</option>
                  <option value="ورشة عمل">ورشة عمل</option>
                  <option value="اجتماع">اجتماع</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              {taskType === 'أخرى' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    تفاصيل المهمة الأخرى <span className="text-slate-400 font-normal">(اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={otherTaskDetails}
                    onChange={(e) => setOtherTaskDetails(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    placeholder="اكتب تفاصيل إضافية عن نوع المهمة (اختياري)"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">وقت البداية</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">وقت النهاية</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">مقر التنفيذ</label>
                <input type="text" value={location_} onChange={(e) => setLocationField(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500" placeholder="مثال: مركز التدريب الرئيسي" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف والتفاصيل</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 resize-none" placeholder="اكتب تفاصيل الخطة هنا..." />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <Spinner /> : (editingTaskId ? 'حفظ التعديلات' : 'إرسال للاعتماد')}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
             <div className="flex items-center justify-between mb-6 border-b pb-4">
               <h2 className="text-xl font-bold text-slate-800">خططي المضافة</h2>
               <button onClick={fetchTasks} className="text-sm text-sky-600 hover:underline">تحديث</button>
             </div>

             {isLoadingTasks ? (
               <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-sky-600" /></div>
             ) : tasks.length === 0 ? (
               <div className="text-center py-12 text-slate-500">لا توجد خطط مضافة حالياً.</div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {tasks.map((task, i) => {
                   const isPending = task.status === 'بانتظار الاعتماد';
                   return (
                     <div key={i} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
                       <div className="flex justify-between items-center mb-3">
                         <span className="font-semibold text-sky-700 text-sm">{task.taskType}</span>
                         <span className={statusStyle(task.status)}>{task.status}</span>
                       </div>

                       <div className="space-y-2 text-sm text-slate-600 mb-4">
                         <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                           <span>{formatDate(task.startDate)} — {formatDate(task.endDate)}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                           <span>{formatTime(task.startTime)} — {formatTime(task.endTime)}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                           <span className="truncate">{task.location}</span>
                         </div>
                       </div>

                       {task.description && (
                         <p className="text-sm text-slate-500 border-t border-slate-100 pt-3 mb-4 line-clamp-2">{task.description}</p>
                       )}

                       {isPending && (
                         <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                           <button
                             onClick={() => startEdit(task)}
                             className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg font-medium transition-colors"
                           >
                             <Pencil className="w-4 h-4" /> تعديل
                           </button>
                           <button
                             onClick={() => handleDelete(task.taskId)}
                             disabled={deletingTaskId === task.taskId}
                             className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors"
                           >
                             {deletingTaskId === task.taskId ? <Spinner /> : <><Trash2 className="w-4 h-4" /> حذف</>}
                           </button>
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
