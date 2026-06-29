export const NOTIFICATION_QUEUE = 'notification';

export enum NotificationEvent {
  // Auth
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password.reset',

  // SPMB
  SPMB_REGISTERED = 'spmb.registered',
  SPMB_RESULT = 'spmb.result',
  SPMB_PAYMENT = 'spmb.payment',

  // Akademik
  GRADE_RELEASED = 'grade.released',
  SCHEDULE_CHANGED = 'schedule.changed',
  ATTENDANCE_WARNING = 'attendance.warning',

  // Keuangan
  INVOICE_CREATED = 'invoice.created',
  PAYMENT_CONFIRMED = 'payment.confirmed',
  PAYMENT_DUE = 'payment.due',

  // Umum
  ANNOUNCEMENT = 'announcement',
}
