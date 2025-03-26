// app/(tabs)/ai.tsx
import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function AIScreen() {
 const colorScheme = useColorScheme();
 const colors = Colors[colorScheme];
 
 // モックのAI提案データ
 const suggestions = [
   {
     id: '1',
     title: '洗濯タスクの最適化',
     description: '洗濯を水曜日の朝に移動すると、あなたの朝の余裕時間を活用でき、他の平日の負担が減ります。',
     impact: 'high',
     reason: '水曜日の朝はあなたの活動パターンから最も余裕がある時間帯です。',
   },
   {
     id: '2',
     title: '買い物の効率化',
     description: '週末に分散している買い物タスクを土曜日の午後にまとめることで、移動時間を削減できます。',
     impact: 'medium',
     reason: '土曜日の午後は交通量が少なく、買い物効率が良いです。',
   },
   {
     id: '3',
     title: 'パートナーとの家事分担の最適化',
     description: '料理タスクをパートナーと交互に担当することで、負担のバランスが改善されます。',
     impact: 'high',
     reason: '現在の分担率はあなた:60%、パートナー:40%です。',
   },
 ];
 
 // 提案のインパクトに応じた色を取得
 const getImpactColor = (impact) => {
   switch (impact) {
     case 'high': return colors.error;
     case 'medium': return colors.warning;
     case 'low': return colors.accent;
     default: return colors.accent;
   }
 };
 
 // インパクトのラベル
 const getImpactLabel = (impact) => {
   switch (impact) {
     case 'high': return '高';
     case 'medium': return '中';
     case 'low': return '低';
     default: return '中';
   }
 };
 
 // 提案の適用
 const handleApplySuggestion = (id) => {
   console.log(`提案 ${id} を適用`);
   // ここで実際の提案適用ロジックを実装
 };
 
 // 提案の後回し
 const handleDeferSuggestion = (id) => {
   console.log(`提案 ${id} を後回し`);
   // ここで後回しロジックを実装
 };
 
 return (
   <ScrollView style={styles.container}>
     <ThemedView style={styles.header}>
       <ThemedText type="title" style={styles.title}>AI家事アシスタント</ThemedText>
       <ThemedText style={styles.subtitle}>
         あなたの生活パターンから最適な家事スケジュールを提案します
       </ThemedText>
     </ThemedView>
     
     {suggestions.map(suggestion => (
       <ThemedView key={suggestion.id} style={styles.card}>
         <ThemedView style={[
           styles.impactBadge, 
           { backgroundColor: getImpactColor(suggestion.impact) }
         ]}>
           <ThemedText style={styles.impactText}>
             効果: {getImpactLabel(suggestion.impact)}
           </ThemedText>
         </ThemedView>
         
         <ThemedText type="subtitle" style={styles.suggestionTitle}>
           {suggestion.title}
         </ThemedText>
         
         <ThemedText style={styles.suggestionDescription}>
           {suggestion.description}
         </ThemedText>
         
         <ThemedView style={styles.reasonContainer}>
           <ThemedText style={styles.reasonLabel}>提案理由:</ThemedText>
           <ThemedText style={styles.reasonText}>{suggestion.reason}</ThemedText>
         </ThemedView>
         
         <ThemedView style={styles.actionButtons}>
           <TouchableOpacity 
             style={[styles.actionButton, styles.deferButton]}
             onPress={() => handleDeferSuggestion(suggestion.id)}
           >
             <ThemedText style={styles.deferButtonText}>後回し</ThemedText>
           </TouchableOpacity>
           
           <TouchableOpacity 
             style={[styles.actionButton, styles.applyButton]}
             onPress={() => handleApplySuggestion(suggestion.id)}
           >
             <ThemedText style={styles.applyButtonText}>適用する</ThemedText>
           </TouchableOpacity>
         </ThemedView>
       </ThemedView>
     ))}
     
     <ThemedView style={styles.aiInfoCard}>
       <ThemedText type="subtitle" style={styles.aiInfoTitle}>
         AIアシスタントについて
       </ThemedText>
       <ThemedText style={styles.aiInfoText}>
         AI家事アシスタントは、あなたの生活パターンやタスク実行履歴から、最適な家事スケジュールを提案します。使い続けるほど、あなたの生活リズムを学習し、より正確な提案ができるようになります。
       </ThemedText>
     </ThemedView>
   </ScrollView>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   padding: 16,
 },
 header: {
   marginBottom: 24,
 },
 title: {
   fontSize: 24,
   marginBottom: 8,
 },
 subtitle: {
   fontSize: 16,
   opacity: 0.7,
 },
 card: {
   backgroundColor: '#f8f8f8',
   borderRadius: 12,
   padding: 16,
   marginBottom: 16,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.1,
   shadowRadius: 4,
   elevation: 2,
 },
 impactBadge: {
   alignSelf: 'flex-start',
   paddingHorizontal: 10,
   paddingVertical: 4,
   borderRadius: 12,
   marginBottom: 12,
 },
 impactText: {
   color: 'white',
   fontSize: 12,
   fontWeight: '600',
 },
 suggestionTitle: {
   fontSize: 18,
   marginBottom: 8,
 },
 suggestionDescription: {
   fontSize: 16,
   lineHeight: 24,
   marginBottom: 16,
 },
 reasonContainer: {
   backgroundColor: '#f0f0f0',
   padding: 12,
   borderRadius: 8,
   marginBottom: 16,
 },
 reasonLabel: {
   fontSize: 14,
   fontWeight: '600',
   marginBottom: 4,
 },
 reasonText: {
   fontSize: 14,
   color: '#666',
 },
 actionButtons: {
   flexDirection: 'row',
   justifyContent: 'flex-end',
 },
 actionButton: {
   paddingVertical: 8,
   paddingHorizontal: 16,
   borderRadius: 8,
   marginLeft: 12,
 },
 deferButton: {
   borderWidth: 1,
   borderColor: '#ddd',
 },
 deferButtonText: {
   fontSize: 14,
 },
 applyButton: {
   backgroundColor: '#3E7BFA',
 },
 applyButtonText: {
   fontSize: 14,
   color: 'white',
   fontWeight: '500',
 },
 aiInfoCard: {
   backgroundColor: '#e6f0fd',
   borderRadius: 12,
   padding: 16,
   marginVertical: 24,
 },
 aiInfoTitle: {
   marginBottom: 8,
 },
 aiInfoText: {
   fontSize: 14,
   lineHeight: 22,
 },
});