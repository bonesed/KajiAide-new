describe('タスク操作フロー', () => {
    beforeAll(async () => {
      await device.launchApp();
    });
  
    beforeEach(async () => {
      await device.reloadReactNative();
    });
  
    it('新しいタスクを作成、編集、完了、削除できる', async () => {
      // ホーム画面からタスク追加ボタンをタップ
      await element(by.id('add-task-button')).tap();
  
      // タスク情報を入力
      await element(by.id('task-title-input')).typeText('買い物に行く');
      await element(by.id('task-description-input')).typeText('牛乳、卵、野菜を買う');
      await element(by.id('task-category-input')).typeText('買い物');
      
      // 優先度を「高」に設定
      await element(by.id('priority-high-button')).tap();
      
      // 期限を設定
      await element(by.id('due-date-toggle')).tap();
      await element(by.id('date-picker-button')).tap();
      // 日付ピッカーの操作は端末依存のため、テスト環境に合わせて調整する必要がある
      
      // タスクを保存
      await element(by.id('save-task-button')).tap();
      
      // タスクがホーム画面に表示されていることを確認
      await expect(element(by.text('買い物に行く'))).toBeVisible();
      
      // タスクをタップして詳細画面に移動
      await element(by.text('買い物に行く')).tap();
      
      // 詳細が正しく表示されていることを確認
      await expect(element(by.text('牛乳、卵、野菜を買う'))).toBeVisible();
      await expect(element(by.text('買い物'))).toBeVisible();
      
      // 編集ボタンをタップ
      await element(by.id('edit-task-button')).tap();
      
      // タスクを編集
      await element(by.id('task-title-input')).clearText();
      await element(by.id('task-title-input')).typeText('スーパーで買い物');
      
      // 編集を保存
      await element(by.id('save-task-button')).tap();
      
      // 編集したタスクが表示されていることを確認
      await expect(element(by.text('スーパーで買い物'))).toBeVisible();
      
      // ホーム画面に戻る
      await element(by.id('back-button')).tap();
      
      // タスクを完了としてマーク
      await element(by.id('checkbox-button')).atIndex(0).tap();
      
      // タスクに取り消し線が表示されていることを確認
      // スタイル確認は実装に依存するため、適宜調整
      
      // タスクを左にスワイプして削除
      await element(by.text('スーパーで買い物')).swipe('left');
      await element(by.text('削除')).tap();
      
      // タスクが削除されたことを確認
      await expect(element(by.text('スーパーで買い物'))).not.toBeVisible();
    });
  
    it('カレンダー画面でタスクを確認できる', async () => {
      // ホーム画面からタスク追加
      await element(by.id('add-task-button')).tap();
      await element(by.id('task-title-input')).typeText('明日の予定');
      
      // 期限を明日に設定
      await element(by.id('due-date-toggle')).tap();
      await element(by.id('date-picker-button')).tap();
      // 日付ピッカーで明日を選択（実装依存）
      
      // タスクを保存
      await element(by.id('save-task-button')).tap();
      
      // カレンダータブに移動
      await element(by.id('calendar-tab')).tap();
      
      // 明日の日付をタップ
      // カレンダーの日付選択はライブラリ依存のため適宜調整
      
      // タスクが表示されていることを確認
      await expect(element(by.text('明日の予定'))).toBeVisible();
    });
  
    it('設定画面で通知をオン/オフできる', async () => {
      // 設定タブに移動
      await element(by.id('settings-tab')).tap();
      
      // リマインダー通知の設定を切り替え
      await element(by.id('reminder-toggle')).tap();
      
      // 設定が保存されたことを確認（実装依存）
      
      // テーマを切り替え
      await element(by.text('テーマ')).tap();
      await element(by.text('ダーク')).tap();
      
      // テーマが変更されたことを確認（実装依存）
    });
  });