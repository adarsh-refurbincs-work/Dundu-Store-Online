import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, TextInput,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { comboApi, categoryApi } from '../../api/index';
import { COLORS, UPLOADS_URL } from '../../config';
import { formatPrice } from '../../utils/format';
import AppHeader from '../../components/ui/AppHeader';
import CategoryStrip from '../../components/ui/CategoryStrip';
import useSettingsStore from '../../store/settings.store';

function getImageUri(src) {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return UPLOADS_URL + (src.startsWith('/') ? src : '/' + src);
}

// Same rating rule as ProductCard: reviews → admin default → 4.5
const ratingOf = (p) => { const a = parseFloat(p?.avg_rating), d = parseFloat(p?.default_rating); return a > 0 ? a : d > 0 ? d : 4.5; };

export function ComboCard({ combo, onPress }) {
  const uri = getImageUri(combo.image_url);
  const hasOffer = combo.offer_price && parseFloat(combo.offer_price) > 0;
  const slotCount = combo.slots?.length || 0;
  // Card rating = average over each slot's first product; reviews = total across them
  const firstProducts = (combo.slots || []).map((s) => (s.products || [])[0]).filter((p) => p && p.id);
  const rating = firstProducts.length ? firstProducts.reduce((s, p) => s + ratingOf(p), 0) / firstProducts.length : 0;
  const reviewCount = firstProducts.reduce((s, p) => s + (parseInt(p.review_count, 10) || 0), 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      <View style={styles.cardImageWrap}>
        {uri
          ? <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />
          : (
            <View style={styles.cardImageFallback}>
              <Text style={styles.cardImageFallbackText}>🎀</Text>
            </View>
          )
        }
        {hasOffer && (
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>
⚡ {Math.round(((parseFloat(combo.price) - parseFloat(combo.offer_price)) / parseFloat(combo.price)) * 100)}% OFF
            </Text>
          </View>
        )}
        <View style={styles.comboBadge}>
          <Text style={styles.comboBadgeText}>Combo Deal</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{combo.name}</Text>

        {/* Slot pills */}
        <View style={styles.slotRow}>
          {(combo.slots || []).slice(0, 3).map((slot, i) => (
            <View key={i} style={styles.slotPill}>
              <Text style={styles.slotPillText} numberOfLines={1}>{slot.slot_label}</Text>
            </View>
          ))}
          {slotCount > 3 && (
            <View style={[styles.slotPill, styles.slotPillMore]}>
              <Text style={styles.slotPillText}>+{slotCount - 3}</Text>
            </View>
          )}
        </View>

        {/* Price + rating */}
        <View style={styles.priceRow}>
          {hasOffer ? (
            <>
              <Text style={styles.offerPrice}>{formatPrice(combo.offer_price)}</Text>
              <Text style={styles.mrpPrice}>{formatPrice(combo.price)}</Text>
            </>
          ) : (
            <Text style={styles.offerPrice}>{formatPrice(combo.price)}</Text>
          )}
          {rating > 0 && (
            <View style={styles.ratingWrap}>
              <Text style={styles.ratingText}>{rating.toFixed(1)} ★</Text>
              {reviewCount > 0 && <Text style={styles.ratingCount}>({reviewCount})</Text>}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ComboListScreen() {
  const navigation = useNavigation();
  const [combos, setCombos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Same festival theming as the Home / Shop top bars
  const festEnabled = useSettingsStore((s) => s.festivalEnabled);
  const festNavBg   = useSettingsStore((s) => s.festivalNavbarColor);
  const festNavText = useSettingsStore((s) => s.festivalNavbarTextColor);

  // ComboList sits in the root stack; Shop is a tab inside MainTabs, so target it as a nested screen.
  const goToShop = (params) => navigation.navigate('MainTabs', { screen: 'Shop', params });

  const handleSearch = () => {
    const q = searchText.trim();
    if (q) { goToShop({ search: q }); setSearchText(''); }
  };

  const fetchCombos = async () => {
    try {
      const res = await comboApi.list();
      setCombos(res.data?.combos || []);
    } catch (e) {
      console.warn('ComboList fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCombos();
    categoryApi.list()
      .then((res) => setCategories(res.categories || res.data?.categories || res || []))
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={[styles.safe, festEnabled && { backgroundColor: festNavBg }]} edges={['left', 'right', 'bottom']}>
      {/* Same top bar as Home / Shop: logo + cart + wishlist */}
      <AppHeader logo showCart showWishlist backgroundColor={festEnabled ? festNavBg : '#F5F0FF'} />

      {/* Search bar — searches the main catalogue */}
      <View style={[styles.searchBar, festEnabled && { backgroundColor: festNavBg, borderBottomColor: festNavBg }]}>
        <TextInput
          style={[
            styles.searchInput,
            festEnabled && { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.25)', color: festNavText },
          ]}
          placeholder="Search products, brands..."
          placeholderTextColor={festEnabled ? 'rgba(255,255,255,0.65)' : '#9CA3AF'}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Category strip with Combos highlighted; other circles jump to that category */}
      <CategoryStrip
        categories={categories}
        activeSlug={null}
        isOfferActive={false}
        isComboActive
        onPressCombo={() => {}}
        onPressOffers={() => goToShop({ offer: true })}
        onPressCategory={(cat) => goToShop({ category: cat.slug, category_name: cat.name })}
        bgColor={festEnabled ? festNavBg : '#F5F0FF'}
        themeColor="#8B5CF6"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : combos.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🎀</Text>
          <Text style={styles.emptyTitle}>No Combos Yet</Text>
          <Text style={styles.emptySubtitle}>Check back soon for amazing combo deals!</Text>
        </View>
      ) : (
        <FlatList
          data={combos}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchCombos(); }}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerInfo}>
              <Text style={styles.headerInfoText}>
                {combos.length} combo{combos.length !== 1 ? 's' : ''} available
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ComboCard
              combo={item}
              onPress={() => navigation.navigate('ComboDetail', { comboId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0FF' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13.5,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },

  list: { padding: 14, paddingBottom: 100, backgroundColor: '#F5F0FF' },

  headerInfo: { marginBottom: 10 },
  headerInfoText: { fontSize: 12, color: '#999', fontWeight: '600' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImageWrap: { height: 200, width: '100%', position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardImageFallback: {
    width: '100%', height: '100%',
    backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center',
  },
  cardImageFallbackText: { fontSize: 60 },

  saveBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: '#000',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10,
  },
  saveBadgeText: { color: '#22c55e', fontSize: 11, fontWeight: '800' },

  comboBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8,
  },
  comboBadgeText: { color: '#fde047', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },

  cardBody: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, lineHeight: 22 },

  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  slotPill: {
    backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: '#DDD6FE',
  },
  slotPillMore: { backgroundColor: '#f5f5f5', borderColor: '#ddd' },
  slotPillText: { fontSize: 11, fontWeight: '700', color: '#7C3AED', maxWidth: 90 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  offerPrice: { fontSize: 22, fontWeight: '900', color: '#7C3AED' },
  ratingWrap: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '800', color: '#F6A800' },
  ratingCount: { fontSize: 11, color: '#999', fontWeight: '600' },
  mrpPrice: { fontSize: 15, color: '#aaa', textDecorationLine: 'line-through', fontWeight: '500' },

  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14, paddingVertical: 11,
    alignItems: 'center',
  },
  buyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 30 },
});
