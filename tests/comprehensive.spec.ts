import { test, expect } from '@playwright/test';

/**
 * Playwright 総合テストスイート
 * Vite + React (TypeScript) 環境向け
 */
test.describe('Playwright 実装検証', () => {

  // 各テストの実行前に初期化
  test.beforeEach(async ({ page }) => {
    // ネットワーク制御: APIをモックしてデフォルトの挙動を安定させる
    await page.route('**/api/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Real User' }),
      });
    });
    // ベースURL（http://localhost:5173）へ移動
    await page.goto('/');
  });

  // 1. E2Eテスト: 操作、遷移、状態、スタイルの検証
  test('E2E: カウントアップとスタイル検証', async ({ page, isMobile }) => {
    // 要素を変数に格納することで、テキスト変更後の再検索エラーを防ぐ
    const btn = page.getByRole('button', { name: /count is/i });
    
    // 表示とスタイルの検証
    await expect(btn).toBeVisible();
    const expectedColor = 'rgb(240, 240, 240)';
    await expect(btn).toHaveCSS('background-color', expectedColor);
    
    // 操作の模倣
    await btn.click();
    
    // 状態変化の検証
    await expect(btn).toHaveText('count is 1');
  });

  // 2. APIテスト: REST API等のレスポンス検証
  test('API: 直接リクエストを送りレスポンスを検証', async ({ page, request }) => {
  // 正しいドメインを指定してモック
  await page.route('https://jsonplaceholder.typicode.com', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1 }),
    });
  });

  const response = await request.get('https://jsonplaceholder.typicode.com');
  expect(response.status()).toBe(200);
});

  // 3. ネットワーク制御: モックとオフライン表示
  test('ネットワーク: モックの確認とオフライン状態の検知', async ({ page }) => {
    // モックが反映されているか確認
    await expect(page.getByTestId('user-name')).toHaveText('Real User');

    // オフライン状態のシミュレーション（リロードはエラーの原因になるため避ける）
    await page.context().setOffline(true);
    
    // アプリ側の「You are offline」表示が出ることを確認
    await expect(page.getByText('You are offline')).toBeVisible();

    // オンラインに戻す
    await page.context().setOffline(false);
    await expect(page.getByText('You are offline')).toBeHidden();
  });

  // 4. ファイル操作: アップロードとダウンロード
  test('ファイル: アップロードおよびダウンロードの検証', async ({ page }) => {
    // アップロード (あらかじめ tests/assets/test-file.txt を作成しておく必要あり)
    await page.setInputFiles('input[aria-label="file-upload"]', 'tests/assets/test-file.txt');
    
    // ダウンロードの待機設定
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download File' }).click();
    const download = await downloadPromise;
    
    // ファイル名の検証
    expect(download.suggestedFilename()).toBe('sample-file.txt');
  });

  // 5. 複数タブ・ウィンドウ: ポップアップを跨いだ操作
  test('複数タブ: 外部リンクを新しいタブで開く検証', async ({ context, page }) => {
    // 新しいページ（タブ）が開くのを待機するプロミス
    const pagePromise = context.waitForEvent('page');
    
    await page.getByRole('link', { name: 'Open New Tab' }).click();
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    
    // 遷移先URLの検証
    expect(newPage.url()).toContain('playwright.dev');
    await newPage.close();
  });

  // 6. モバイルエミュレーション & 言語・タイムゾーン検証
  test('環境検証: モバイル操作と言語設定の反映', async ({ page, isMobile }) => {
    // 言語とタイムゾーンのテキスト表示を確認
    const localeText = page.getByText(/Locale:/);
    const timezoneText = page.getByText(/TZ:/);

    if (isMobile) {
      // モバイルプロジェクト（iPhone等）で実行されている場合
      // タッチ操作（tap）のシミュレーション
      await page.getByRole('button', { name: /count is/i }).tap();
      await expect(page.getByRole('button', { name: /count is 1/i })).toBeVisible();

      // configで設定した言語（ja-JP等）が反映されているか
      await expect(localeText).toContainText('ja-JP');
      await expect(timezoneText).toContainText('Asia/Tokyo');
    } else {
      // デスクトップ環境の場合
      await expect(localeText).not.toBeEmpty();
    }
  });

  // 7. ビジュアル回帰テスト: スクリーンショット比較
  test('ビジュアル: 画面全体のスクリーンショット比較', async ({ page }) => {
    // 初回実行時に正解画像が作成され、2回目以降に比較される
    await expect(page).toHaveScreenshot('initial-load.png', {
      maxDiffPixels: 100, // わずかなアンチエイリアスの差を許容
    });
  });

});
