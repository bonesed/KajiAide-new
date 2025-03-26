import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks/useRedux';
import { generateSuggestions, applySuggestion } from '../../store/slices/aiSlice';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../../theme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AIRecommendationsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { suggestions, loading, hasAppliedSuggestion } = useAppSelector(state => state.ai);
  
  // 提案の取得
  useEffect(() => {
    dispatch(generateSuggestions());
  }, [dispatch]);
  
  // 提案の適用
  const handleApplySuggestion = (suggestionId) => {
    dispatch(applySuggestion(suggestionId));
  };
  
  // 提案の後回し
  const handleDeferSuggestion = (suggestionId) => {
    // 後回しの実装（実際にはFirestoreに保存する等）
    console.log('提案を後回し:', suggestionId);
  };
  
  // 提案カードのレンダリング
  const renderSuggestionItem = ({ item }) => {
    return (
      <Card style={styles.suggestionCard}>
        <View style={styles.impactBadge}>
          <Text style={styles.impactText}>
            効果: {getImpactLabel(item.impact)}
          </Text>
        </View>
        
        <Text style={styles.suggestionTitle}>{item.title}</Text>
        <Text style={styles.suggestionDescription}>{item.description}</Text>
        
        {(item.suggestedDate || item.suggestedTime) && (
          <View style={styles.timingContainer}>
            <Text style={styles.timingTitle}>推奨タイミング:</Text>
            <Text style={styles.timingText}>
              {item.suggestedDate ? formatDate(item.suggestedDate) : ''}
              {item.suggestedDate && item.suggestedTime ? ' ' : ''}
              {item.suggestedTime ? item.suggestedTime : ''}
            </Text>
          </View>
        )}
        
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonTitle}>理由:</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <Button
            title="後回し"
            variant="outline"
            onPress={() => handleDeferSuggestion(item.id)}
            style={styles.deferButton}
          />
          <Button
            title="適用する"
            onPress={() => handleApplySuggestion(item.id)}
            style={styles.applyButton}
          />
        </View>
      </Card>
    );
  };
  
  // 提案適用後の表示
  const renderAppliedState = () => {
    return (
      <View style={styles.appliedContainer}>
        <View style={styles.appliedIcon}>
          <Text style={styles.appliedIconText}>✓</Text>
        </View>
        <Text style={styles.appliedTitle}>提案を適用しました！</Text>
        <Text style={styles.appliedDescription}>
          タスクのスケジュールが最適化されました。ホーム画面またはカレンダーから確認できます。
        </Text>
        <Button
          title="ホーム画面に戻る"
          onPress={() => navigation.navigate('HomeStack')}
          style={styles.backButton}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AIアシスタント提案</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>AIがあなたに最適な提案を生成中...</Text>
        </View>
      ) : hasAppliedSuggestion ? (
        renderAppliedState()
      ) : suggestions.length > 0 ? (
        <FlatList
          data={suggestions}
          keyExtractor={item => item.id}
          renderItem={renderSuggestionItem}
          contentContainerStyle={styles.suggestionsContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>現在の提案はありません</Text>
          <Text style={styles.emptyStateDescription}>
            より多くのタスクデータが蓄積されると、パターンに基づいた提案が表示されます。
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// ユーティリティ関数
const getImpactLabel = (impact) => {
  switch (impact) {
    case 'high': return '高';
    case 'medium': return '中';
    case 'low': return '低';
    default: return '中';
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.textLight,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  suggestionsContainer: {
    padding: Spacing.lg,
  },
  suggestionCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  impactBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accent,
    marginBottom: Spacing.sm,
  },
  impactText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: Typography.semibold,
  },
  suggestionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  suggestionDescription: {
    ...Typography.body1,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  timingContainer: {
    marginBottom: Spacing.sm,
  },
  timingTitle: {
    ...Typography.body2,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  timingText: {
    ...Typography.body2,
    color: Colors.primary,
  },
  reasonContainer: {
    marginBottom: Spacing.md,
  },
  reasonTitle: {
    ...Typography.body2,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  reasonText: {
    ...Typography.body2,
    color: Colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deferButton: {
    marginRight: Spacing.sm,
  },
  applyButton: {},
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateDescription: {
    ...Typography.body1,
    color: Colors.textLight,
    textAlign: 'center',
  },
  appliedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  appliedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  appliedIconText: {
    fontSize: 40,
    color: Colors.background,
  },
  appliedTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  appliedDescription: {
    ...Typography.body1,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    minWidth: 200,
  },
});

export default AIRecommendationsScreen;
