import { NotificationItem } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const NOTIFICATIONS_STORAGE_KEY = 'facrial_notifications_v1';

// Inisialisasi notifikasi awal bertema investigasi hukum politik
const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'comment',
    title: 'Komentar Baru pada Tragedi Trisakti',
    message: 'Prof. Dr. Bagir Manan mengomentari analisis Anda: "Penegakan hukum kasus pelanggaran HAM berat masa lalu membutuhkan keberanian yudisial."',
    authorName: 'Prof. Dr. Bagir Manan',
    postSlug: 'tragedi-trisakti-mei-1998-pengusutan-yuridis-pelanggaran-ham',
    postId: 'post-hukum-1',
    createdAt: '5 menit yang lalu',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'notif-2',
    type: 'comment',
    title: 'Tanggapan pada Dekrit Presiden 2001',
    message: 'Aktivis LBH Jakarta menambahkan perspektif hukum tata negara mengenai kedudukan Maklumat Presiden.',
    authorName: 'Aktivis LBH Jakarta',
    postSlug: 'dekrit-presiden-gus-dur-2001-konflik-ketatanegaraan-dan-impeachment',
    postId: 'post-hukum-2',
    createdAt: '25 menit yang lalu',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'notif-3',
    type: 'agenda',
    title: 'Peringatan Agenda Sidang MK',
    message: 'Agenda Eksaminasi Publik Putusan MK mengenai Batas Usia Capres/Cawapres akan dimulai besok pukul 09:00 WIB.',
    postSlug: 'eksaminasi-publik-putusan-mk-usia-capres-cawapres',
    postId: 'agenda-1',
    createdAt: '2 jam yang lalu',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=200&q=80',
  },
];

export function getNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return initialNotifications;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotifications));
      return initialNotifications;
    }
    return JSON.parse(raw);
  } catch {
    return initialNotifications;
  }
}

export function saveNotifications(notifications: NotificationItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.warn('Gagal menyimpan notifikasi:', err);
  }
}

export async function addNotification(
  item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>
): Promise<NotificationItem> {
  const newNotif: NotificationItem = {
    ...item,
    id: 'notif-' + Date.now(),
    createdAt: 'Baru saja',
    read: false,
  };

  const current = getNotifications();
  const updated = [newNotif, ...current].slice(0, 50); // Simpan maks 50 notifikasi terbaru
  saveNotifications(updated);

  // Trigger real-time event untuk popup notifikasi di navbar
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('facrial_realtime_notification', {
        detail: newNotif,
      })
    );
  }

  // Sinkronisasi ke Supabase jika terhubung
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('notifications').insert([
        {
          id: newNotif.id,
          type: newNotif.type,
          title: newNotif.title,
          message: newNotif.message,
          author_name: newNotif.authorName,
          post_slug: newNotif.postSlug,
          post_id: newNotif.postId,
          read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Fallback lokal aktif
    }
  }

  return newNotif;
}

export function markNotificationAsRead(id: string): NotificationItem[] {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('facrial_notifications_updated'));
  }
  return updated;
}

export function markAllNotificationsAsRead(): NotificationItem[] {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('facrial_notifications_updated'));
  }
  return updated;
}
