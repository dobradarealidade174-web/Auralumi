import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Appointment, Staff } from '../../types';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Scissors, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch staff
    const staffQuery = query(collection(db, 'staff'), where('professionalId', '==', auth.currentUser.uid));
    onSnapshot(staffQuery, (snap) => {
      setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));
    });

    const q = query(
      collection(db, 'appointments'),
      where('professionalId', '==', auth.currentUser.uid),
      orderBy('date', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#4A3F3F]">Agenda Semanal</h1>
          <p className="text-[#6D5D5D]">Visualize e organize seus horários.</p>
        </div>
        <div className="flex items-center bg-white rounded-full border border-[#F8E8E8] p-1 shadow-sm">
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="p-2 hover:bg-[#FFF9F9] rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-medium text-sm">
            {format(weekStart, "d 'de' MMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}
          </span>
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 hover:bg-[#FFF9F9] rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayAppointments = appointments.filter(app => isSameDay(parseISO(app.date), day));
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toString()} className="space-y-4">
              <div className={cn(
                "text-center p-3 rounded-2xl border",
                isToday ? "bg-[#D48C8C] border-[#D48C8C] text-white shadow-md" : "bg-white border-[#F8E8E8]"
              )}>
                <p className="text-[10px] uppercase font-bold opacity-70">{format(day, 'EEE', { locale: ptBR })}</p>
                <p className="text-lg font-bold">{format(day, 'd')}</p>
              </div>

              <div className="space-y-3">
                {dayAppointments.length === 0 ? (
                  <div className="text-[10px] text-center text-[#9E8E8E] py-4 italic">Sem agendamentos</div>
                ) : (
                  dayAppointments.map(app => (
                    <div key={app.id} className="p-3 bg-white rounded-xl border border-[#F8E8E8] shadow-sm hover:border-[#D48C8C] transition-all cursor-pointer">
                      <p className="text-xs font-bold text-[#4A3F3F] truncate">{app.clientName}</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#6D5D5D] mt-1">
                        <Clock size={10} /> {format(parseISO(app.date), 'HH:mm')}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#D48C8C] mt-0.5">
                        <Scissors size={10} /> {app.serviceName}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#9E8E8E] mt-0.5 font-medium">
                        <User size={10} /> 
                        {app.staffId === auth.currentUser?.uid ? 'Você' : staff.find(s => s.id === app.staffId)?.name || 'Profissional'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
