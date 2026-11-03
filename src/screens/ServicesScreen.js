import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getMyRole } from '../admin/adminService';
import { useAuth } from '../auth/AuthContext';
import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getMyProfessionalApplication,
  submitProfessionalApplication,
} from '../services/professionalAccessService';
import {
  getServiceLabel,
  serviceCategoryGroups,
} from '../services/serviceCategories';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';


import ServiceCategoryPublicList from '../components/ServiceCategoryPublicList';
const copy = {
  en: {
    intro: 'Profiles in this area use private owner data, USG moderation and admin-controlled public visibility.',
    privateTitle: 'Privacy by default',
    privateText: 'Professional users can complete their own profile and contact data. Private data stays visible only to the profile owner and USG administration unless an administrator explicitly approves a field for public display.',
    accessTitle: 'Professional access',
    guestText: 'Sign in to apply for professional or organization access.',
    applyText: 'Only approved professional and organization accounts can create and manage profiles in this section.',
    type: 'Account type',
    professional: 'Professional',
    organization: 'Organization',
    categories: 'Categories',
    message: 'Application message',
    messagePlaceholder: 'Briefly describe your professional activity or organization.',
    submit: 'SUBMIT APPLICATION',
    submitting: 'SUBMITTINGР Р†Р вЂљР’В¦',
    chooseCategory: 'Choose at least one category.',
    submitFailed: 'The application could not be submitted.',
    pending: 'Your application is pending administrator review.',
    approved: 'Your professional access is approved.',
    rejected: 'Your application was rejected. You can update it and submit again.',
    needs_changes: 'Changes were requested. Update your application and submit again.',
    admin: 'Administrator access is active.',
    status: 'Status',
    adminNote: 'Admin note',
  },
  bg: {
    intro: 'Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР В Р’В»Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В Р вЂ  Р РЋРІР‚С™Р В Р’В°Р В Р’В·Р В РЎвЂ Р РЋР С“Р В Р’ВµР В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂР В Р’В·Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р’В·Р В Р вЂ Р В Р’В°Р РЋРІР‚С™ Р В Р’В»Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В РЎвЂ Р В Р вЂ¦Р В Р’В° Р РЋР С“Р В РЎвЂўР В Р’В±Р РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В°, USG Р В РЎВР В РЎвЂўР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂ Р В РЎвЂ”Р РЋРЎвЂњР В Р’В±Р В Р’В»Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В Р’В° Р В Р вЂ Р В РЎвЂР В РўвЂР В РЎвЂР В РЎВР В РЎвЂўР РЋР С“Р РЋРІР‚С™, Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р’В»Р В РЎвЂР РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’В° Р В РЎвЂўР РЋРІР‚С™ Р В Р’В°Р В РўвЂР В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљ.',
    privateTitle: 'Р В РЎСџР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р В Р’ВµР В Р’В»Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™ Р В РЎвЂ”Р В РЎвЂў Р В РЎвЂ”Р В РЎвЂўР В РўвЂР РЋР вЂљР В Р’В°Р В Р’В·Р В Р’В±Р В РЎвЂР РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’Вµ',
    privateText: 'Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В Р’ВµР РЋР С“Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р’В°Р В Р’В»Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР РЋРІР‚С™Р РЋР вЂљР В Р’ВµР В Р’В±Р В РЎвЂР РЋРІР‚С™Р В Р’ВµР В Р’В»Р В РЎвЂ Р В РЎВР В РЎвЂўР В РЎвЂ“Р В Р’В°Р РЋРІР‚С™ Р В РўвЂР В Р’В° Р В РЎвЂ”Р В РЎвЂўР В РЎвЂ”Р РЋР вЂ°Р В Р’В»Р В Р вЂ¦Р РЋР РЏР РЋРІР‚С™ Р РЋР С“Р В Р вЂ Р В РЎвЂўР РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР В Р’В» Р В РЎвЂ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В РЎвЂ Р В Р’В·Р В Р’В° Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚С™Р В Р’В°Р В РЎвЂќР РЋРІР‚С™. Р В РІР‚С”Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В РЎвЂ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ Р В Р’В°Р РЋРІР‚С™ Р В Р вЂ Р В РЎвЂР В РўвЂР В РЎвЂР В РЎВР В РЎвЂ Р РЋР С“Р В Р’В°Р В РЎВР В РЎвЂў Р В Р’В·Р В Р’В° Р РЋР С“Р В РЎвЂўР В Р’В±Р РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В° Р В Р вЂ¦Р В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР В Р’В»Р В Р’В° Р В РЎвЂ USG Р В Р’В°Р В РўвЂР В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏР РЋРІР‚С™Р В Р’В°, Р В РЎвЂўР РЋР С“Р В Р вЂ Р В Р’ВµР В Р вЂ¦ Р В Р’В°Р В РЎвЂќР В РЎвЂў Р В Р’В°Р В РўвЂР В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљ Р В РЎвЂР В Р’В·Р РЋР вЂљР В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂў Р В Р вЂ¦Р В Р’Вµ Р РЋР вЂљР В Р’В°Р В Р’В·Р РЋР вЂљР В Р’ВµР РЋРІвЂљВ¬Р В РЎвЂ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂќР РЋР вЂљР В Р’ВµР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р’Вµ Р В Р’В·Р В Р’В° Р В РЎвЂ”Р РЋРЎвЂњР В Р’В±Р В Р’В»Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂў Р В РЎвЂ”Р В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В Р’Вµ.',
    accessTitle: 'Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В Р’ВµР РЋР С“Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р’В°Р В Р’В»Р В Р’ВµР В Р вЂ¦ Р В РўвЂР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР вЂ°Р В РЎвЂ”',
    guestText: 'Р В РІР‚в„ўР В Р’В»Р В Р’ВµР В Р’В· Р В Р вЂ  Р В Р’В°Р В РЎвЂќР В Р’В°Р РЋРЎвЂњР В Р вЂ¦Р РЋРІР‚С™Р В Р’В° Р РЋР С“Р В РЎвЂ, Р В Р’В·Р В Р’В° Р В РўвЂР В Р’В° Р В РЎвЂќР В Р’В°Р В Р вЂ¦Р В РўвЂР В РЎвЂР В РўвЂР В Р’В°Р РЋРІР‚С™Р РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В Р’В°Р РЋРІвЂљВ¬ Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В РЎвЂў Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В Р’ВµР РЋР С“Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р’В°Р В Р’В»Р В РЎвЂР РЋР С“Р РЋРІР‚С™ Р В РЎвЂР В Р’В»Р В РЎвЂ Р В РЎвЂўР РЋР вЂљР В РЎвЂ“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ.',
    applyText: 'Р В Р Р‹Р В Р’В°Р В РЎВР В РЎвЂў Р В РЎвЂўР В РўвЂР В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В Р’ВµР РЋР С“Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р’В°Р В Р’В»Р В Р вЂ¦Р В РЎвЂ Р В РЎвЂ Р В РЎвЂўР РЋР вЂљР В РЎвЂ“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р вЂ¦Р В РЎвЂ Р В Р’В°Р В РЎвЂќР В Р’В°Р РЋРЎвЂњР В Р вЂ¦Р РЋРІР‚С™Р В РЎвЂ Р В РЎВР В РЎвЂўР В РЎвЂ“Р В Р’В°Р РЋРІР‚С™ Р В РўвЂР В Р’В° Р РЋР С“Р РЋР вЂ°Р В Р’В·Р В РўвЂР В Р’В°Р В Р вЂ Р В Р’В°Р РЋРІР‚С™ Р В РЎвЂ Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р вЂ Р В Р’В°Р РЋРІР‚С™ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР В Р’В»Р В РЎвЂ Р В Р вЂ  Р РЋРІР‚С™Р В Р’В°Р В Р’В·Р В РЎвЂ Р РЋР С“Р В Р’ВµР В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ.',
    type: 'Р В РЎС›Р В РЎвЂР В РЎвЂ” Р В Р’В°Р В РЎвЂќР В Р’В°Р РЋРЎвЂњР В Р вЂ¦Р РЋРІР‚С™',
    professional: 'Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В Р’ВµР РЋР С“Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р’В°Р В Р’В»Р В РЎвЂР РЋР С“Р РЋРІР‚С™',
    organization: 'Р В РЎвЂєР РЋР вЂљР В РЎвЂ“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ',
    categories: 'Р В РЎв„ўР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂўР РЋР вЂљР В РЎвЂР В РЎвЂ',
    message: 'Р В Р Р‹Р РЋР вЂ°Р В РЎвЂўР В Р’В±Р РЋРІР‚В°Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂќР РЋР вЂ°Р В РЎВ Р В Р’В·Р В Р’В°Р РЋР РЏР В Р вЂ Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В Р’В°',
    messagePlaceholder: 'Р В РЎвЂєР В РЎвЂ”Р В РЎвЂР РЋРІвЂљВ¬Р В РЎвЂ Р В Р вЂ¦Р В Р’В°Р В РЎвЂќР РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В РЎвЂќР В РЎвЂў Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В Р’ВµР РЋР С“Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р’В°Р В Р’В»Р В Р вЂ¦Р В Р’В°Р РЋРІР‚С™Р В Р’В° Р РЋР С“Р В РЎвЂ Р В РўвЂР В Р’ВµР В РІвЂћвЂ“Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™ Р В РЎвЂР В Р’В»Р В РЎвЂ Р В РЎвЂўР РЋР вЂљР В РЎвЂ“Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏР РЋРІР‚С™Р В Р’В°.',
    submit: 'Р В Р’ВР В РІР‚вЂќР В РЎСџР В Р’В Р В РЎвЂ™Р В РЎС›Р В Р’В Р В РІР‚вЂќР В РЎвЂ™Р В Р вЂЎР В РІР‚в„ўР В РЎв„ўР В РЎвЂ™',
    submitting: 'Р В Р’ВР В РІР‚вЂќР В РЎСџР В Р’В Р В РЎвЂ™Р В Р’В©Р В РЎвЂ™Р В РЎСљР В РІР‚СћР Р†Р вЂљР’В¦',
    chooseCategory: 'Р В Р’ВР В Р’В·Р В Р’В±Р В Р’ВµР РЋР вЂљР В РЎвЂ Р В РЎвЂ”Р В РЎвЂўР В Р вЂ¦Р В Р’Вµ Р В Р’ВµР В РўвЂР В Р вЂ¦Р В Р’В° Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В РЎвЂ“Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР РЏ.',
    submitFailed: 'Р В РІР‚вЂќР В Р’В°Р РЋР РЏР В Р вЂ Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В Р’В° Р В Р вЂ¦Р В Р’Вµ Р В РЎВР В РЎвЂўР В Р’В¶Р В Р’В° Р В РўвЂР В Р’В° Р В Р’В±Р РЋР вЂ°Р В РўвЂР В Р’Вµ Р В РЎвЂР В Р’В·Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р вЂ¦Р В Р’В°.',
    pending: 'Р В РІР‚вЂќР В Р’В°Р РЋР РЏР В Р вЂ Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В Р’В° Р РЋРІР‚С™Р В РЎвЂ Р РЋРІР‚РЋР В Р’В°Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В Р’ВµР В РЎвЂ“Р В Р’В»Р В Р’ВµР В РўвЂ Р В РЎвЂўР РЋРІР‚С™ Р В Р’В°Р В РўвЂР В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљ.',
    approved: 'Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В Р’ВµР РЋР С“Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р’В°Р В Р’В»Р В Р вЂ¦Р В РЎвЂР РЋР РЏР РЋРІР‚С™ Р РЋРІР‚С™Р В РЎвЂ Р В РўвЂР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР вЂ°Р В РЎвЂ” Р В Р’Вµ Р В РЎвЂўР В РўвЂР В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’ВµР В Р вЂ¦.',
    rejected: 'Р В РІР‚вЂќР В Р’В°Р РЋР РЏР В Р вЂ Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В Р’В° Р В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚В¦Р В Р вЂ Р РЋР вЂ°Р РЋР вЂљР В Р’В»Р В Р’ВµР В Р вЂ¦Р В Р’В°. Р В РЎС™Р В РЎвЂўР В Р’В¶Р В Р’ВµР РЋРІвЂљВ¬ Р В РўвЂР В Р’В° Р РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІвЂљВ¬ Р В РЎвЂ Р В РЎвЂР В Р’В·Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В РЎвЂР РЋРІвЂљВ¬ Р В РЎвЂўР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂў.',
    needs_changes: 'Р В Р’ВР В Р’В·Р В РЎвЂР РЋР С“Р В РЎвЂќР В Р’В°Р В Р вЂ¦Р В РЎвЂ Р РЋР С“Р В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂ. Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂ Р В Р’В·Р В Р’В°Р РЋР РЏР В Р вЂ Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р В Р’В° Р В РЎвЂ Р РЋР РЏ Р В РЎвЂР В Р’В·Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В РЎвЂ Р В РЎвЂўР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂў.',
    admin: 'Р В РЎвЂ™Р В РўвЂР В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР РЋР С“Р В РЎвЂќР В РЎвЂР РЋР РЏР РЋРІР‚С™ Р В РўвЂР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР вЂ°Р В РЎвЂ” Р В Р’Вµ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р’ВµР В Р вЂ¦.',
    status: 'Р В Р Р‹Р РЋРІР‚С™Р В Р’В°Р РЋРІР‚С™Р РЋРЎвЂњР РЋР С“',
    adminNote: 'Р В РІР‚ВР В Р’ВµР В Р’В»Р В Р’ВµР В Р’В¶Р В РЎвЂќР В Р’В° Р В РЎвЂўР РЋРІР‚С™ Р В Р’В°Р В РўвЂР В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљ',
  },
  it: {
    intro: 'I profili di questa sezione usano dati privati del proprietario, moderazione USG e visibilitР вЂњР’В  pubblica controllata dallР Р†Р вЂљРІвЂћСћamministratore.',
    privateTitle: 'Privacy predefinita',
    privateText: 'Gli utenti professionali possono completare il proprio profilo e i dati di contatto. I dati privati restano visibili solo al proprietario del profilo e allР Р†Р вЂљРІвЂћСћamministrazione USG, salvo approvazione esplicita di un campo per la visualizzazione pubblica.',
    accessTitle: 'Accesso professionale',
    guestText: 'Accedi per candidarti come professionista o organizzazione.',
    applyText: 'Solo gli account professionali e organizzativi approvati possono creare e gestire profili in questa sezione.',
    type: 'Tipo di account',
    professional: 'Professionista',
    organization: 'Organizzazione',
    categories: 'Categorie',
    message: 'Messaggio della candidatura',
    messagePlaceholder: 'Descrivi brevemente la tua attivitР вЂњР’В  professionale o organizzazione.',
    submit: 'INVIA CANDIDATURA',
    submitting: 'INVIOР Р†Р вЂљР’В¦',
    chooseCategory: 'Seleziona almeno una categoria.',
    submitFailed: 'Non Р вЂњР Рѓ stato possibile inviare la candidatura.',
    pending: 'La candidatura Р вЂњР Рѓ in attesa di revisione da parte dellР Р†Р вЂљРІвЂћСћamministratore.',
    approved: 'Il tuo accesso professionale Р вЂњР Рѓ stato approvato.',
    rejected: 'La candidatura Р вЂњР Рѓ stata rifiutata. Puoi aggiornarla e inviarla di nuovo.',
    needs_changes: 'Sono state richieste modifiche. Aggiorna la candidatura e inviala di nuovo.',
    admin: 'LР Р†Р вЂљРІвЂћСћaccesso amministratore Р вЂњР Рѓ attivo.',
    status: 'Stato',
    adminNote: 'Nota amministratore',
  },
};

function getApplicationFromResult(data) {
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data ?? null;
}

export default function ServicesScreen({ navigation, route }) {
  const publicCategoryKey = route?.params?.categoryKey;

  if (publicCategoryKey) {
    return (
      <ServiceCategoryPublicList
        categoryKey={publicCategoryKey}
        onBack={() => navigation.goBack()}
        onNext={(nextCategoryKey) =>
          navigation.setParams({
            categoryKey: nextCategoryKey,
            profileId: undefined,
          })
        }
        onOpenProfile={(profileId) =>
          navigation.navigate('Services', {
            profileId,
            categoryKey: publicCategoryKey,
          })
        }
      />
    );
  }
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;

  const [role, setRole] = useState(null);
  const [application, setApplication] = useState(null);
  const [requestedType, setRequestedType] = useState('professional');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [accessLoading, setAccessLoading] = useState(Boolean(user));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const activeGroup = serviceCategoryGroups.find((group) =>
    requestedType === 'organization'
      ? group.key === 'organizations'
      : group.key === 'professionals'
  );

  useEffect(() => {
    let active = true;

    async function loadAccess() {
      if (!user) {
        if (active) {
          setRole(null);
          setApplication(null);
          setAccessLoading(false);
        }
        return;
      }

      setAccessLoading(true);

      const [roleResult, applicationResult] = await Promise.all([
        getMyRole(user.id),
        getMyProfessionalApplication(),
      ]);

      if (!active) {
        return;
      }

      const nextApplication = getApplicationFromResult(applicationResult.data);

      setRole(roleResult.data?.role ?? 'user');
      setApplication(nextApplication);

      if (nextApplication) {
        setRequestedType(nextApplication.requested_type ?? 'professional');
        setSelectedCategories(nextApplication.categories ?? []);
        setMessage(nextApplication.message ?? '');
      }

      setAccessLoading(false);
    }

    loadAccess();

    return () => {
      active = false;
    };
  }, [user]);

  function selectType(type) {
    setRequestedType(type);
    setSelectedCategories([]);
    setFormError('');
  }

  function toggleCategory(key) {
    setSelectedCategories((current) =>
      current.includes(key)
        ? current.filter((value) => value !== key)
        : [...current, key]
    );
    setFormError('');
  }

  async function submitApplication() {
    if (selectedCategories.length === 0) {
      setFormError(labels.chooseCategory);
      return;
    }

    setSubmitting(true);
    setFormError('');

    const result = await submitProfessionalApplication({
      requestedType,
      categories: selectedCategories,
      message,
    });

    if (result.error) {
      setFormError(labels.submitFailed);
      setSubmitting(false);
      return;
    }

    const refreshed = await getMyProfessionalApplication();

    setApplication(getApplicationFromResult(refreshed.data));
    setSubmitting(false);
  }

  const canApply =
    user &&
    role === 'user' &&
    (!application ||
      application.status === 'rejected' ||
      application.status === 'needs_changes');

  const accessMessage =
    role === 'admin'
      ? labels.admin
      : role === 'professional' || role === 'organization'
        ? labels.approved
        : application?.status
          ? labels[application.status]
          : null;

  return (
    <USGSectionScreen
      resetScrollOnFocus
      heroImage={require('../../assets/services-hero.png')}
      kicker={t('sections.services.kicker')}
      title={t('sections.services.title')}
      subtitle={t('sections.services.subtitle')}
      body={labels.intro}
    >
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>{labels.privateTitle}</Text>
        <Text style={styles.noticeText}>{labels.privateText}</Text>
      </View>

      <View style={styles.accessCard}>
        <Text style={styles.accessTitle}>{labels.accessTitle}</Text>
        <Text style={styles.accessText}>
          {!user ? labels.guestText : labels.applyText}
        </Text>

        {accessLoading ? (
          <Text style={styles.statusText}>Р Р†Р вЂљР’В¦</Text>
        ) : accessMessage ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>
              {labels.status}: {application?.status ?? role}
            </Text>
            <Text style={styles.statusText}>{accessMessage}</Text>
            {application?.admin_note ? (
              <Text style={styles.adminNote}>
                {labels.adminNote}: {application.admin_note}
              </Text>
            ) : null}
          </View>
        ) : null}

        {canApply ? (
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>{labels.type}</Text>

            <View style={styles.typeRow}>
              {['professional', 'organization'].map((type) => {
                const selected = requestedType === type;

                return (
                  <Pressable
                    key={type}
                    onPress={() => selectType(type)}
                    style={[
                      styles.typeButton,
                      selected && styles.typeButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        selected && styles.typeButtonTextSelected,
                      ]}
                    >
                      {labels[type]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>{labels.categories}</Text>

            <View style={styles.categorySelectList}>
              {(activeGroup?.items ?? []).map((item) => {
                const selected = selectedCategories.includes(item.key);

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => toggleCategory(item.key)}
                    style={[
                      styles.selectRow,
                      selected && styles.selectRowSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected ? <Text style={styles.checkmark}>Р Р†РЎС™РІР‚Сљ</Text> : null}
                    </View>
                    <Text style={styles.selectLabel}>
                      {getServiceLabel(item, language)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>{labels.message}</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={labels.messagePlaceholder}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
              style={styles.messageInput}
            />

            {formError ? (
              <Text style={styles.formError}>{formError}</Text>
            ) : null}

            <Pressable
              disabled={submitting}
              onPress={submitApplication}
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? labels.submitting : labels.submit}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {serviceCategoryGroups.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.groupTitle}>
            {getServiceLabel(group, language)}
          </Text>

          <View style={styles.grid}>
            {group.items.map((item) => (
              <View key={item.key} style={styles.categoryCard}>
                <View style={styles.dot} />
                <Text style={styles.categoryLabel}>
                  {getServiceLabel(item, language)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </USGSectionScreen>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    notice: {
      marginTop: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.activeSurface,
      padding: spacing.md,
    },
    noticeTitle: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
    },
    noticeText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 8,
    },
    accessCard: {
      marginTop: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
    },
    accessTitle: {
      color: colors.gold,
      fontSize: 15,
      fontWeight: '800',
      textAlign: 'center',
    },
    accessText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 8,
    },
    statusBox: {
      marginTop: 14,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 12,
    },
    statusLabel: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    statusText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
      textAlign: 'center',
    },
    adminNote: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 8,
    },
    form: {
      marginTop: 16,
    },
    fieldLabel: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginTop: 12,
      marginBottom: 8,
    },
    typeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    typeButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 10,
    },
    typeButtonSelected: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    typeButtonText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
    },
    typeButtonTextSelected: {
      color: colors.gold,
    },
    categorySelectList: {
      gap: 7,
    },
    selectRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    selectRowSelected: {
      borderColor: colors.goldDark,
      backgroundColor: colors.activeSurface,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    checkboxSelected: {
      borderColor: colors.gold,
      backgroundColor: colors.gold,
    },
    checkmark: {
      color: colors.background,
      fontSize: 13,
      fontWeight: '900',
    },
    selectLabel: {
      flex: 1,
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    messageInput: {
      minHeight: 100,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
      paddingHorizontal: 12,
      paddingVertical: 11,
      textAlignVertical: 'top',
    },
    formError: {
      color: colors.error ?? '#d76c6c',
      fontSize: 11,
      lineHeight: 17,
      marginTop: 10,
      textAlign: 'center',
    },
    submitButton: {
      minHeight: 46,
      marginTop: 14,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    group: {
      marginTop: spacing.lg,
    },
    groupTitle: {
      color: colors.goldSoft,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.8,
      textAlign: 'center',
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    grid: {
      gap: 9,
    },
    categoryCard: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 15,
      paddingVertical: 11,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.gold,
      marginRight: 12,
    },
    categoryLabel: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
  });
}
