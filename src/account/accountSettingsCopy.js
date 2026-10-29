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
    dangerHint: 'Account deletion will be added as a separate protected step with confirmation.',
    dangerUnavailable: 'ACCOUNT DELETION NOT AVAILABLE YET',
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
    dangerHint: 'Изтриването на акаунт ще бъде отделна защитена стъпка с потвърждение.',
    dangerUnavailable: 'ИЗТРИВАНЕТО НА АКАУНТ ОЩЕ НЕ Е АКТИВНО',
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
    dangerHint: 'L’eliminazione dell’account verrà aggiunta come passaggio protetto separato con conferma.',
    dangerUnavailable: 'ELIMINAZIONE ACCOUNT NON ANCORA DISPONIBILE',
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
