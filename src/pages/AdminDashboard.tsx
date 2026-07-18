import React, { useState } from 'react';
import { apiCall } from '../lib/api';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('التدريب');
  const [role, setRole] = useState('الموظف');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !fullName || !department || !role || !email) {
      toast.error('الرجاء تعبئة جميع الحقول الإلزامية');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiCall("employee.add", {
        employee: {
          employeeId,
          fullName,
          jobTitle,
          department,
          role,
          email
        }
      });
      
      if (response.success) {
        toast.success(response.message || 'تمت إضافة الموظف بنجاح');
        // Reset form
        setEmployeeId(''); setFullName(''); setJobTitle(''); setDepartment('التدريب'); setRole('الموظف'); setEmail('');
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="bg-sky-100 p-2 rounded-lg text-sky-700">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">إضافة موظف جديد</h2>
        </div>
        
        <form onSubmit={handleAddEmployee} className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الرقم الوظيفي</label>
              <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500" dir="ltr" autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الرباعي</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">المسمى الوظيفي</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">القسم / الإدارة</label>
              <select 
                value={department} 
                disabled 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
              >
                <option value="التدريب">التدريب</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الصلاحية (الدور)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500">
                <option value="الموظف">الموظف</option>
                <option value="رئيس القسم">رئيس القسم</option>
                <option value="مسؤول النظام">مسؤول النظام</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors flex items-center justify-center gap-2">
              {isSubmitting ? <Spinner /> : 'حفظ بيانات الموظف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
