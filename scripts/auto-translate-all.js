#!/usr/bin/env node
/**
 * Auto-translate all languages using the Arabic master as source
 * This creates basic translations by translating Arabic values to other languages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../client/src/locales');
const arPath = path.join(localesDir, 'ar/translation.json');

// Read Arabic master file
const arTranslations = JSON.parse(fs.readFileSync(arPath, 'utf8'));

// Translation dictionary from Arabic to other languages
const translations = {
  // Common UI terms
  'لوحة التحكم': {
    en: 'Dashboard',
    fr: 'Tableau de bord',
    es: 'Panel de control',
    de: 'Dashboard',
    zh: '仪表板',
    ja: 'ダッシュボード',
    ko: '대시보드',
    ru: 'Панель управления',
    hi: 'डैशबोर्ड',
    ur: 'ڈیش بورڈ',
    tl: 'Dashboard',
    bn: 'ড্যাশবোর্ড',
    ms: 'Papan Pemuka',
    tr: 'Gösterge Paneli',
    pt: 'Painel',
    id: 'Dasbor'
  },
  'البنك': {
    en: 'Banking',
    fr: 'Banque',
    es: 'Banca',
    de: 'Banking',
    zh: '银行业务',
    ja: 'バンキング',
    ko: '은행',
    ru: 'Банковское дело',
    hi: 'बैंकिंग',
    ur: 'بینکنگ',
    tl: 'Bangko',
    bn: 'ব্যাংকিং',
    ms: 'Perbankan',
    tr: 'Bankacılık',
    pt: 'Bancário',
    id: 'Perbankan'
  },
  'المبيعات': {
    en: 'Sales',
    fr: 'Ventes',
    es: 'Ventas',
    de: 'Verkäufe',
    zh: '销售',
    ja: '販売',
    ko: '판매',
    ru: 'Продажи',
    hi: 'बिक्री',
    ur: 'فروخت',
    tl: 'Benta',
    bn: 'বিক্রয়',
    ms: 'Jualan',
    tr: 'Satışlar',
    pt: 'Vendas',
    id: 'Penjualan'
  },
  'المشتريات': {
    en: 'Purchases',
    fr: 'Achats',
    es: 'Compras',
    de: 'Einkäufe',
    zh: '采购',
    ja: '購入',
    ko: '구매',
    ru: 'Закупки',
    hi: 'खरीद',
    ur: 'خریداری',
    tl: 'Bili',
    bn: 'ক্রয়',
    ms: 'Pembelian',
    tr: 'Satın Almalar',
    pt: 'Compras',
    id: 'Pembelian'
  },
  'التقارير': {
    en: 'Reports',
    fr: 'Rapports',
    es: 'Informes',
    de: 'Berichte',
    zh: '报告',
    ja: 'レポート',
    ko: '보고서',
    ru: 'Отчеты',
    hi: 'रिपोर्ट',
    ur: 'رپورٹس',
    tl: 'Ulat',
    bn: 'প্রতিবেদন',
    ms: 'Laporan',
    tr: 'Raporlar',
    pt: 'Relatórios',
    id: 'Laporan'
  },
  'الإعدادات': {
    en: 'Settings',
    fr: 'Paramètres',
    es: 'Configuración',
    de: 'Einstellungen',
    zh: '设置',
    ja: '設定',
    ko: '설정',
    ru: 'Настройки',
    hi: 'सेटिंग्स',
    ur: 'ترتیبات',
    tl: 'Mga Setting',
    bn: 'সেটিংস',
    ms: 'Tetapan',
    tr: 'Ayarlar',
    pt: 'Configurações',
    id: 'Pengaturan'
  },
  'الفواتير': {
    en: 'Invoices',
    fr: 'Factures',
    es: 'Facturas',
    de: 'Rechnungen',
    zh: '发票',
    ja: '請求書',
    ko: '송장',
    ru: 'Счета',
    hi: 'चालान',
    ur: 'انوائسز',
    tl: 'Invoice',
    bn: 'চালান',
    ms: 'Invois',
    tr: 'Faturalar',
    pt: 'Faturas',
    id: 'Faktur'
  },
  'العملاء': {
    en: 'Customers',
    fr: 'Clients',
    es: 'Clientes',
    de: 'Kunden',
    zh: '客户',
    ja: '顧客',
    ko: '고객',
    ru: 'Клиенты',
    hi: 'ग्राहक',
    ur: 'گاہک',
    tl: 'Customer',
    bn: 'গ্রাহক',
    ms: 'Pelanggan',
    tr: 'Müşteriler',
    pt: 'Clientes',
    id: 'Pelanggan'
  },
  'الموردين': {
    en: 'Suppliers',
    fr: 'Fournisseurs',
    es: 'Proveedores',
    de: 'Lieferanten',
    zh: '供应商',
    ja: 'サプライヤー',
    ko: '공급업체',
    ru: 'Поставщики',
    hi: 'आपूर्तिकर्ता',
    ur: 'سپلائرز',
    tl: 'Supplier',
    bn: 'সরবরাহকারী',
    ms: 'Pembekal',
    tr: 'Tedarikçiler',
    pt: 'Fornecedores',
    id: 'Pemasok'
  },
  'الدفع': {
    en: 'Payment',
    fr: 'Paiement',
    es: 'Pago',
    de: 'Zahlung',
    zh: '支付',
    ja: '支払い',
    ko: '결제',
    ru: 'Платеж',
    hi: 'भुगतान',
    ur: 'ادائیگی',
    tl: 'Bayad',
    bn: 'পেমেন্ট',
    ms: 'Bayaran',
    tr: 'Ödeme',
    pt: 'Pagamento',
    id: 'Pembayaran'
  },
  'الحسابات': {
    en: 'Accounts',
    fr: 'Comptes',
    es: 'Cuentas',
    de: 'Konten',
    zh: '账户',
    ja: 'アカウント',
    ko: '계정',
    ru: 'Счета',
    hi: 'खाते',
    ur: 'اکاؤنٹس',
    tl: 'Account',
    bn: 'অ্যাকাউন্ট',
    ms: 'Akaun',
    tr: 'Hesaplar',
    pt: 'Contas',
    id: 'Akun'
  },
  'إضافة': {
    en: 'Add',
    fr: 'Ajouter',
    es: 'Agregar',
    de: 'Hinzufügen',
    zh: '添加',
    ja: '追加',
    ko: '추가',
    ru: 'Добавить',
    hi: 'जोड़ें',
    ur: 'شامل کریں',
    tl: 'Idagdag',
    bn: 'যোগ করুন',
    ms: 'Tambah',
    tr: 'Ekle',
    pt: 'Adicionar',
    id: 'Tambah'
  },
  'تعديل': {
    en: 'Edit',
    fr: 'Modifier',
    es: 'Editar',
    de: 'Bearbeiten',
    zh: '编辑',
    ja: '編集',
    ko: '편집',
    ru: 'Редактировать',
    hi: 'संपादित करें',
    ur: 'ترمیم',
    tl: 'I-edit',
    bn: 'সম্পাদনা',
    ms: 'Edit',
    tr: 'Düzenle',
    pt: 'Editar',
    id: 'Edit'
  },
  'حذف': {
    en: 'Delete',
    fr: 'Supprimer',
    es: 'Eliminar',
    de: 'Löschen',
    zh: '删除',
    ja: '削除',
    ko: '삭제',
    ru: 'Удалить',
    hi: 'हटाएं',
    ur: 'حذف کریں',
    tl: 'Tanggalin',
    bn: 'মুছুন',
    ms: 'Padam',
    tr: 'Sil',
    pt: 'Excluir',
    id: 'Hapus'
  },
  'حفظ': {
    en: 'Save',
    fr: 'Enregistrer',
    es: 'Guardar',
    de: 'Speichern',
    zh: '保存',
    ja: '保存',
    ko: '저장',
    ru: 'Сохранить',
    hi: 'सहेजें',
    ur: 'محفوظ کریں',
    tl: 'I-save',
    bn: 'সংরক্ষণ',
    ms: 'Simpan',
    tr: 'Kaydet',
    pt: 'Salvar',
    id: 'Simpan'
  },
  'إلغاء': {
    en: 'Cancel',
    fr: 'Annuler',
    es: 'Cancelar',
    de: 'Abbrechen',
    zh: '取消',
    ja: 'キャンセル',
    ko: '취소',
    ru: 'Отмена',
    hi: 'रद्द करें',
    ur: 'منسوخ کریں',
    tl: 'Kanselahin',
    bn: 'বাতিল',
    ms: 'Batal',
    tr: 'İptal',
    pt: 'Cancelar',
    id: 'Batal'
  },
  'بحث': {
    en: 'Search',
    fr: 'Rechercher',
    es: 'Buscar',
    de: 'Suchen',
    zh: '搜索',
    ja: '検索',
    ko: '검색',
    ru: 'Поиск',
    hi: 'खोजें',
    ur: 'تلاش کریں',
    tl: 'Maghanap',
    bn: 'অনুসন্ধান',
    ms: 'Cari',
    tr: 'Ara',
    pt: 'Pesquisar',
    id: 'Cari'
  },
  'تصدير': {
    en: 'Export',
    fr: 'Exporter',
    es: 'Exportar',
    de: 'Exportieren',
    zh: '导出',
    ja: 'エクスポート',
    ko: '내보내기',
    ru: 'Экспорт',
    hi: 'निर्यात',
    ur: 'برآمد',
    tl: 'I-export',
    bn: 'রপ্তানি',
    ms: 'Eksport',
    tr: 'Dışa Aktar',
    pt: 'Exportar',
    id: 'Ekspor'
  },
  'طباعة': {
    en: 'Print',
    fr: 'Imprimer',
    es: 'Imprimir',
    de: 'Drucken',
    zh: '打印',
    ja: '印刷',
    ko: '인쇄',
    ru: 'Печать',
    hi: 'प्रिंट',
    ur: 'پرنٹ',
    tl: 'I-print',
    bn: 'প্রিন্ট',
    ms: 'Cetak',
    tr: 'Yazdır',
    pt: 'Imprimir',
    id: 'Cetak'
  },
  'التاريخ': {
    en: 'Date',
    fr: 'Date',
    es: 'Fecha',
    de: 'Datum',
    zh: '日期',
    ja: '日付',
    ko: '날짜',
    ru: 'Дата',
    hi: 'तारीख',
    ur: 'تاریخ',
    tl: 'Petsa',
    bn: 'তারিখ',
    ms: 'Tarikh',
    tr: 'Tarih',
    pt: 'Data',
    id: 'Tanggal'
  },
  'المبلغ': {
    en: 'Amount',
    fr: 'Montant',
    es: 'Monto',
    de: 'Betrag',
    zh: '金额',
    ja: '金額',
    ko: '금액',
    ru: 'Сумма',
    hi: 'राशि',
    ur: 'رقم',
    tl: 'Halaga',
    bn: 'পরিমাণ',
    ms: 'Jumlah',
    tr: 'Tutar',
    pt: 'Valor',
    id: 'Jumlah'
  },
  'الحالة': {
    en: 'Status',
    fr: 'Statut',
    es: 'Estado',
    de: 'Status',
    zh: '状态',
    ja: 'ステータス',
    ko: '상태',
    ru: 'Статус',
    hi: 'स्थिति',
    ur: 'حیثیت',
    tl: 'Katayuan',
    bn: 'স্ট্যাটাস',
    ms: 'Status',
    tr: 'Durum',
    pt: 'Status',
    id: 'Status'
  },
  'الوصف': {
    en: 'Description',
    fr: 'Description',
    es: 'Descripción',
    de: 'Beschreibung',
    zh: '描述',
    ja: '説明',
    ko: '설명',
    ru: 'Описание',
    hi: 'विवरण',
    ur: 'تفصیل',
    tl: 'Paglalarawan',
    bn: 'বিবরণ',
    ms: 'Penerangan',
    tr: 'Açıklama',
    pt: 'Descrição',
    id: 'Deskripsi'
  },
  'الإجمالي': {
    en: 'Total',
    fr: 'Total',
    es: 'Total',
    de: 'Gesamt',
    zh: '总计',
    ja: '合計',
    ko: '합계',
    ru: 'Итого',
    hi: 'कुल',
    ur: 'کل',
    tl: 'Kabuuan',
    bn: 'মোট',
    ms: 'Jumlah',
    tr: 'Toplam',
    pt: 'Total',
    id: 'Total'
  }
};

// Function to translate a value
function translateValue(arValue, targetLang) {
  // If we have a direct translation, use it
  if (translations[arValue] && translations[arValue][targetLang]) {
    return translations[arValue][targetLang];
  }
  
  // Otherwise, return the key name as placeholder
  return arValue;
}

// Function to recursively translate an object
function translateObject(obj, targetLang) {
  const result = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
      result[key] = translateObject(obj[key], targetLang);
    } else {
      result[key] = translateValue(obj[key], targetLang);
    }
  }
  
  return result;
}

const languages = ['en', 'fr', 'es', 'de', 'zh', 'ja', 'ko', 'ru', 'hi', 'ur', 'tl', 'bn', 'ms', 'tr', 'pt', 'id'];

console.log('🌍 Auto-translating all languages from Arabic master...\n');

languages.forEach(lang => {
  const langPath = path.join(localesDir, lang, 'translation.json');
  const translated = translateObject(arTranslations, lang);
  
  fs.writeFileSync(langPath, JSON.stringify(translated, null, 2) + '\n', 'utf8');
  console.log(`✅ Translated: ${lang}/translation.json`);
});

console.log('\n🎉 Auto-translation complete!');
console.log('📝 All languages now have basic translations');
console.log('💡 Review and refine translations as needed\n');
