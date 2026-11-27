import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getAvatarPreset } from '../profile/avatarPresets';

const labelsByLanguage = {
  bg: {
    button: 'АКТИВНИ НА КАРТАТА',
    compactButton: 'АКТИВНИ',
    title: 'Активни на картата',
    description: 'Показват се само хора, разрешили споделяне на локация, с обновена позиция през последните 15 минути. Това не означава, че са онлайн.',
    search: 'Търси по име, град или държава',
    country: 'ДЪРЖАВА',
    city: 'ГРАД',
    allCountries: 'Всички държави',
    allCities: 'Всички градове',
    back: 'НАЗАД',
    empty: 'Няма активни потребители с разрешено споделяне.',
    noMatches: 'Няма съвпадения с търсенето.',
    error: 'Неуспешно зареждане. Опитай отново.',
    refresh: 'ОБНОВИ',
    close: 'ЗАТВОРИ',
    showOnMap: 'ПОКАЖИ НА КАРТАТА',
    member: 'USG Member',
  },
  en: {
    button: 'ACTIVE ON MAP',
    compactButton: 'ACTIVE',
    title: 'Active on the map',
    description: 'Only members who opted in to location sharing and updated their position in the last 15 minutes appear here. This does not mean they are online.',
    search: 'Search name, city or country',
    country: 'COUNTRY',
    city: 'CITY',
    allCountries: 'All countries',
    allCities: 'All cities',
    back: 'BACK',
    empty: 'No active members are sharing their location.',
    noMatches: 'No members match your search.',
    error: 'Could not load members. Try again.',
    refresh: 'REFRESH',
    close: 'CLOSE',
    showOnMap: 'SHOW ON MAP',
    member: 'USG Member',
  },
  it: {
    button: 'ATTIVI SULLA MAPPA',
    compactButton: 'ATTIVI',
    title: 'Attivi sulla mappa',
    description: 'Sono visibili solo i membri che hanno autorizzato la condivisione della posizione e l’hanno aggiornata negli ultimi 15 minuti. Non significa che siano online.',
    search: 'Cerca nome, città o paese',
    country: 'PAESE',
    city: 'CITTÀ',
    allCountries: 'Tutti i paesi',
    allCities: 'Tutte le città',
    back: 'INDIETRO',
    empty: 'Nessun membro attivo sta condividendo la posizione.',
    noMatches: 'Nessun risultato per questa ricerca.',
    error: 'Impossibile caricare i membri. Riprova.',
    refresh: 'AGGIORNA',
    close: 'CHIUDI',
    showOnMap: 'MOSTRA SULLA MAPPA',
    member: 'USG Member',
  },
};

function normalizeFilterValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sortedFilterValues(values, language) {
  return Array.from(new Set(values.map(normalizeFilterValue).filter(Boolean)))
    .sort((left, right) => left.localeCompare(right, language));
}

export function getActiveMapUsersCopy(language) {
  return labelsByLanguage[language] ?? labelsByLanguage.en;
}

export default function ActiveMapUsersModal({
  visible,
  users,
  loading,
  error,
  language,
  onClose,
  onRefresh,
  onSelect,
}) {
  const labels = getActiveMapUsersCopy(language);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [pickerType, setPickerType] = useState('');

  const countryOptions = useMemo(() =>
    sortedFilterValues(users.map((member) => member.country), language),
  [users, language]);
  const selectedCountry = countryOptions.includes(country) ? country : '';

  const cityOptions = useMemo(() => sortedFilterValues(
    users.filter((member) => !selectedCountry || normalizeFilterValue(member.country) === selectedCountry)
      .map((member) => member.city),
    language
  ), [users, selectedCountry, language]);
  const selectedCity = cityOptions.includes(city) ? city : '';

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return users.filter((member) => {
      if (selectedCountry && normalizeFilterValue(member.country) !== selectedCountry) return false;
      if (selectedCity && normalizeFilterValue(member.city) !== selectedCity) return false;
      return !term || [
        member.display_name,
        member.username,
        member.city,
        member.country,
      ].some((value) => String(value ?? '').toLocaleLowerCase().includes(term));
    });
  }, [query, users, selectedCountry, selectedCity]);

  const pickerItems = pickerType === 'country' ? countryOptions : cityOptions;
  const pickerAllLabel = pickerType === 'country' ? labels.allCountries : labels.allCities;

  function choosePickerItem(value) {
    if (pickerType === 'country') {
      setCountry(value);
      setCity('');
    } else {
      setCity(value);
    }
    setPickerType('');
  }

  function closeModal() {
    setPickerType('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => pickerType ? setPickerType('') : closeModal()}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.panel}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{labels.title} · {users.length}</Text>
              <Text style={styles.description}>{labels.description}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={labels.close}
              onPress={closeModal}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          {pickerType ? (
            <>
              <View style={styles.pickerHeading}>
                <Pressable
                  onPress={() => setPickerType('')}
                  accessibilityRole="button"
                  accessibilityLabel={labels.back}
                  style={styles.pickerBackButton}
                >
                  <Text style={styles.pickerBackText}>‹ {labels.back}</Text>
                </Pressable>
                <Text style={styles.pickerTitle}>
                  {pickerType === 'country' ? labels.country : labels.city}
                </Text>
              </View>
              <FlatList
                style={styles.list}
                data={['', ...pickerItems]}
                keyExtractor={(item, index) => `${index}:${item}`}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const selected = (pickerType === 'country' ? selectedCountry : selectedCity) === item;
                  return (
                    <Pressable
                      onPress={() => choosePickerItem(item)}
                      accessibilityRole="button"
                      accessibilityLabel={item || pickerAllLabel}
                      style={styles.pickerChoice}
                    >
                      <Text style={[styles.pickerChoiceText, selected && styles.pickerChoiceSelectedText]}>
                        {item || pickerAllLabel}
                      </Text>
                      {selected ? <Text style={styles.pickerCheck}>✓</Text> : null}
                    </Pressable>
                  );
                }}
              />
            </>
          ) : (
            <>
              <View style={styles.filterRow}>
                <View style={styles.filterColumn}>
                  <Text style={styles.filterLabel}>{labels.country}</Text>
                  <Pressable
                    onPress={() => setPickerType('country')}
                    accessibilityRole="button"
                    accessibilityLabel={`${labels.country}: ${selectedCountry || labels.allCountries}`}
                    style={styles.filterSelect}
                  >
                    <Text style={styles.filterValue} numberOfLines={1}>
                      {selectedCountry || labels.allCountries}
                    </Text>
                    <Text style={styles.filterArrow}>⌄</Text>
                  </Pressable>
                </View>
                <View style={styles.filterColumn}>
                  <Text style={styles.filterLabel}>{labels.city}</Text>
                  <Pressable
                    onPress={() => setPickerType('city')}
                    accessibilityRole="button"
                    accessibilityLabel={`${labels.city}: ${selectedCity || labels.allCities}`}
                    style={styles.filterSelect}
                  >
                    <Text style={styles.filterValue} numberOfLines={1}>
                      {selectedCity || labels.allCities}
                    </Text>
                    <Text style={styles.filterArrow}>⌄</Text>
                  </Pressable>
                </View>
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={labels.search}
                placeholderTextColor="#9b9a99"
                style={styles.search}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Pressable
                onPress={onRefresh}
                disabled={loading}
                accessibilityRole="button"
                style={styles.refreshButton}
              >
                {loading ? <ActivityIndicator color="#d4af37" size="small" /> : null}
                <Text style={styles.refreshText}>{labels.refresh}</Text>
              </Pressable>
              {error ? <Text style={styles.error}>{labels.error}</Text> : null}
              <FlatList
                style={styles.list}
                data={filteredUsers}
                keyExtractor={(item) => String(item.user_id)}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={loading ? (
                  <ActivityIndicator color="#d4af37" size="large" />
                ) : (
                  <Text style={styles.empty}>{query.trim() || selectedCountry || selectedCity ? labels.noMatches : labels.empty}</Text>
                )}
                renderItem={({ item }) => {
                  const name = item.display_name || (item.username ? `@${item.username}` : labels.member);
                  const area = [item.city, item.country].filter(Boolean).join(' · ');
                  return (
                    <Pressable
                      style={styles.memberRow}
                      onPress={() => onSelect(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`${name}. ${labels.showOnMap}`}
                    >
                      <Image source={getAvatarPreset(item.avatar_preset).source} style={styles.avatar} />
                      <View style={styles.memberText}>
                        <Text style={styles.name} numberOfLines={1}>{name}</Text>
                        {item.display_name && item.username ? (
                          <Text style={styles.username} numberOfLines={1}>@{item.username}</Text>
                        ) : null}
                        {area ? <Text style={styles.area} numberOfLines={1}>{area}</Text> : null}
                      </View>
                      <Text style={styles.mapAction}>⌖</Text>
                    </Pressable>
                  );
                }}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  panel: {
    height: '82%',
    paddingTop: 19,
    paddingHorizontal: 18,
    paddingBottom: 24,
    backgroundColor: '#0b0c0e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#d4af37',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#d4af37',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 9,
  },
  description: {
    color: '#c8c4bb',
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    minWidth: 38,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6e5e36',
    borderRadius: 20,
  },
  closeText: {
    fontSize: 24,
    color: '#d4af37',
    lineHeight: 28,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    marginBottom: 2,
  },
  filterColumn: {
    flex: 1,
    minWidth: 0,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d4af37',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  filterSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5b4c27',
    paddingHorizontal: 12,
    backgroundColor: '#151619',
  },
  filterValue: {
    flex: 1,
    color: '#f8f4ed',
    fontSize: 12,
    fontWeight: '700',
  },
  filterArrow: {
    color: '#d4af37',
    fontSize: 20,
    marginBottom: 5,
  },
  pickerHeading: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  pickerBackText: {
    color: '#d4af37',
    fontSize: 13,
    fontWeight: '800',
  },
  pickerTitle: {
    color: '#f8f4ed',
    fontSize: 13,
    fontWeight: '800',
  },
  pickerChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#34322e',
  },
  pickerChoiceText: {
    flex: 1,
    color: '#f8f4ed',
    fontSize: 14,
  },
  pickerChoiceSelectedText: {
    color: '#d4af37',
    fontWeight: '800',
  },
  pickerCheck: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 12,
  },
  search: {
    minHeight: 44,
    marginTop: 17,
    marginBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5b4c27',
    backgroundColor: '#151619',
    color: '#ffffff',
    fontSize: 14,
  },
  refreshButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 7,
  },
  refreshText: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 28,
    flexGrow: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    minHeight: 78,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#34322e',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#d4af37',
  },
  memberText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8f4ed',
  },
  username: {
    marginTop: 3,
    color: '#d4af37',
    fontSize: 12,
  },
  area: {
    marginTop: 4,
    color: '#aba9a5',
    fontSize: 12,
  },
  mapAction: {
    fontSize: 26,
    color: '#d4af37',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#bbb7ad',
    fontSize: 14,
    lineHeight: 21,
  },
  error: {
    color: '#eda5a5',
    marginBottom: 12,
    fontSize: 12,
  },
});
