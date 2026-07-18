import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiCall } from '../lib/api';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { PlusCircle, ListTodo, Clock, MapPin, Calendar } from 'lucide-react';
import clsx from 'clsx';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('list');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  // Add Task Form State
  const [taskType, setTaskType] = useState('');
  const [otherTaskDetails, setOtherTaskDetails] = useState(''); // تفاصيل إضافية لخيار "أخرى"
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    if (!user) return;
    setIsLoadingTasks(true);
    try {
      const response = await apiCall("task.getByEmployee", { employeeId: user.employeeId });
      if (response.success && response.data) {
        setTasks(response.data);
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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskType || !startDate || !endDate || !startTime || !endTime || !location || !description) {
      toast.error('الرجاء تعبئة جميع الحقول');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiCall("task.add", {
        task: {
          employeeId: user?.employeeId,
          employeeName: user?.fullName,
          taskType: taskType === 'أخرى' && otherTaskDetails ? `أخرى: ${otherTaskDetails}` : taskType,
          startDate,
          endDate,
          startTime,
          endTime,
          location,
          description
        }
      });
      
      if (response.success) {
        toast.success(response.message || 'تمت إضافة خطة العمل بنجاح');
        // Reset form
        setTaskType(''); setOtherTaskDetails(''); setStartDate(''); setEndDate(''); setStartTime(''); setEndTime(''); setLocation(''); setDescription('');
        setActiveTab('list');
      } else {
        toast.error(response.message || 'حدث خطأ أثناء الإضافة');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-full sm:w-fit mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('list')}
          className={clsx(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all",
            activeTab === 'list' ? "bg-white text-sky-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <ListTodo className="w-5 h-5" />
          خططي
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={clsx(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all",
            activeTab === 'add' ? "bg-white text-sky-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <PlusCircle className="w-5 h-5" />
          إضافة خطة
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">إضافة خطة عمل جديدة</h2>
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

              {/* حقل تفاصيل إضافية يظهر فقط عند اختيار "أخرى" */}
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
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    />
                    {!startDate && (
                      <span className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">اختر التاريخ</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ النهاية</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    />
                    {!endDate && (
                      <span className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">اختر التاريخ</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">وقت البداية</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    />
                    {!startTime && (
                      <span className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">اختر الوقت</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">وقت النهاية</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    />
                    {!endTime && (
                      <span className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">اختر الوقت</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">مقر التنفيذ</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500" placeholder="مثال: مركز التدريب الرئيسي" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف والتفاصيل</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 resize-none" placeholder="اكتب تفاصيل الخطة هنا..." />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <Spinner /> : 'إرسال للاعتماد'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
             <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">خططي المضافة</h2>
             
             {isLoadingTasks ? (
               <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-sky-600" /></div>
             ) : tasks.length === 0 ? (
               <div className="text-center py-12 text-slate-500">لا توجد خطط مضافة حالياً.</div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {tasks.map((task, i) => (
                   <div key={i} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-4">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                         {task.taskType}
                       </span>
                       <span className={clsx(
                         "text-xs font-bold px-2 py-1 rounded",
                         task.status === 'بانتظار الاعتماد' ? "bg-amber-100 text-amber-800" :
                         task.status === 'معتمد' ? "bg-emerald-100 text-emerald-800" :
                         "bg-red-100 text-red-800"
                       )}>
                         {task.status}
                       </span>
                     </div>
                     <h3 className="font-bold text-slate-800 mb-2 truncate">{task.description}</h3>
                     
                     <div className="space-y-2 text-sm text-slate-600">
                       <div className="flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-slate-400" />
                         <span>{task.startDate} - {task.endDate}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Clock className="w-4 h-4 text-slate-400" />
                         <span>{task.startTime} - {task.endTime}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-slate-400" />
                         <span className="truncate">{task.location}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
