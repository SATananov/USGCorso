export const accountSettingsCopy = {
  en: {
    email: 'Account email',
    memberSince: 'Member since',
    password: 'Password',
    passwordHint: 'Send a secure password reset link to your account email.',
    passwordAction: 'SEND RESET LINK',
    passwordSending: 'Sending reset link...',
    passwordSent: 'Password reset email sent.',
    passwordError: 'Password reset email could not be sent.',
    security: 'Security',
    securityHint: 'Your session is protected by Supabase authentication.',
    dangerTitle: 'Danger zone',
    dangerHint: 'Delete the account, profile and user-owned files permanently.',
    dangerAction: 'DELETE ACCOUNT',
    dangerWarning: 'This action is permanent. Type DELETE to confirm.',
    dangerConfirmLabel: 'Type DELETE',
    dangerConfirmAction: 'PERMANENTLY DELETE',
    dangerCancel: 'CANCEL',
    dangerBusy: 'Deleting account...',
    dangerConfirmError: 'Type DELETE exactly to continue.',
    dangerDeleteError: 'The account could not be deleted.',
    dangerLastAdmin: 'The last administrator cannot delete the account. Add another administrator first.',
  },
  bg: {
    email: 'Имейл на акаунта',
    memberSince: 'Член от',
    password: 'Парола',
    passwordHint: 'Изпрати защитен линк за смяна на паролата към имейла на акаунта.',
    passwordAction: 'ИЗПРАТИ ЛИНК ЗА СМЯНА',
    passwordSending: 'Изпращане на линк...',
    passwordSent: 'Имейлът за смяна на паролата е изпратен.',
    passwordError: 'Имейлът за смяна на паролата не можа да бъде изпратен.',
    security: 'Сигурност',
    securityHint: 'Текущата сесия е защитена чрез Supabase authentication.',
    dangerTitle: 'Опасна зона',
    dangerHint: 'Изтрий завинаги акаунта, профила и файловете, собственост на потребителя.',
    dangerAction: 'ИЗТРИЙ АКАУНТА',
    dangerWarning: 'Това действие е необратимо. Напиши DELETE за потвърждение.',
    dangerConfirmLabel: 'Напиши DELETE',
    dangerConfirmAction: 'ИЗТРИЙ ЗАВИНАГИ',
    dangerCancel: 'ОТКАЗ',
    dangerBusy: 'Изтриване на акаунта...',
    dangerConfirmError: 'Напиши точно DELETE, за да продължиш.',
    dangerDeleteError: 'Акаунтът не можа да бъде изтрит.',
    dangerLastAdmin: 'Последният администратор не може да изтрие акаунта си. Първо добави друг администратор.',
  },
  it: {
    email: 'Email account',
    memberSince: 'Membro dal',
    password: 'Password',
    passwordHint: 'Invia un link sicuro per reimpostare la password all’email dell’account.',
    passwordAction: 'INVIA LINK DI RIPRISTINO',
    passwordSending: 'Invio del link...',
    passwordSent: 'Email per il ripristino della password inviata.',
    passwordError: 'Impossibile inviare l’email di ripristino.',
    security: 'Sicurezza',
    securityHint: 'La sessione corrente è protetta tramite autenticazione Supabase.',
    dangerTitle: 'Zona pericolosa',
    dangerHint: 'Elimina definitivamente account, profilo e file di proprietà dell’utente.',
    dangerAction: 'ELIMINA ACCOUNT',
    dangerWarning: 'Questa azione è permanente. Digita DELETE per confermare.',
    dangerConfirmLabel: 'Digita DELETE',
    dangerConfirmAction: 'ELIMINA DEFINITIVAMENTE',
    dangerCancel: 'ANNULLA',
    dangerBusy: 'Eliminazione account...',
    dangerConfirmError: 'Digita esattamente DELETE per continuare.',
    dangerDeleteError: 'Impossibile eliminare l’account.',
    dangerLastAdmin: 'L’ultimo amministratore non può eliminare il proprio account. Aggiungi prima un altro amministratore.',
  },
};

export function formatMemberSince(value, language) {
  if (!value) {
    return '—';
  }

  const locale =
    language === 'bg'
      ? 'bg-BG'
      : language === 'it'
        ? 'it-IT'
        : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(new Date(value));
}
