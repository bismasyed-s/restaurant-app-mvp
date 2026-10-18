import React, { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

function MenuItemCard({
  item,
  styles,
  colors,
  isFavorite,
  isImageBroken,
  onImageError,
  onAddToCart,
  onToggleFavorite,
}) {
  // This log makes card render behavior visible in the development console.
  console.log(`MenuItemCard rendered: ${item.name}`);

  return (
    <View style={[styles.card, !item.isAvailable && styles.cardUnavailable]}>
      <View style={styles.imageContainer}>
        {!isImageBroken ? (
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="cover"
            onError={() => onImageError(item.id)}
          />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: getCategoryColor(item.category, colors) }]}>
            <Text style={styles.fallbackEmoji}>{getCategoryEmoji(item.category)}</Text>
            <Text style={styles.fallbackText}>{item.category}</Text>
          </View>
        )}

        {item.isSpecial && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialBadgeText}>Daily Special {'\u2B50'}</Text>
          </View>
        )}

        {!item.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableBadgeText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.itemName, !item.isAvailable && styles.textDisabled]} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(item.id)}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
            activeOpacity={0.8}
          >
            <Text style={[styles.favoriteText, isFavorite && styles.favoriteActive]}>
              {isFavorite ? '\u2665' : '\u2661'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.itemPrice, !item.isAvailable && styles.textDisabled]}>
            ${item.price.toFixed(2)}
          </Text>
        </View>

        <Text style={[styles.itemDescription, !item.isAvailable && styles.textDisabled]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, !item.isAvailable && styles.addButtonDisabled]}
            disabled={!item.isAvailable}
            onPress={() => onAddToCart(item)}
            activeOpacity={0.8}
          >
            <Text style={[styles.addButtonText, !item.isAvailable && styles.addButtonTextDisabled]}>
              {item.isAvailable ? '+ Add to Cart' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function getCategoryColor(category, colors) {
  switch (category) {
    case 'Starters': return colors.success;
    case 'Mains': return colors.primaryLight;
    case 'Desserts': return colors.warning;
    case 'Drinks': return colors.borderLight;
    default: return colors.surface;
  }
}

function getCategoryEmoji(category) {
  switch (category) {
    case 'Starters': return '\u{1F967}';
    case 'Mains': return '\u{1F969}';
    case 'Desserts': return '\u{1F370}';
    case 'Drinks': return '\u{1F379}';
    default: return '\u{1F37D}\uFE0F';
  }
}

export default memo(MenuItemCard);

