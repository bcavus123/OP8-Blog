Exit code: 0
Wall time: 1.9 seconds
Output:
# OP8 Operating Partner Value Creation Framework test ortamı

Yerel test ortamı, `Test Yöneticisi` hesabıyla otomatik oturum açar. Bu davranış yalnızca `LOCAL_TEST_MODE=1` iken etkindir; canlı yayında kapalıdır.

Kurulum ve başlatma: `npm run test:env`. Komut yerel veritabanını hazırlar, migrasyonu uygular ve siteyi başlatır.

Test edilecek ana ekran: `/admin/kategoriler`

Kontrol listesi:

- Yeni kategori ekle; slug alanını boş bırakarak otomatik oluşumu doğrula.
- Aynı slug ile ikinci kategori ekleyerek benzersizlik uyarısını doğrula.
- Kategoriyi düzenle ve renk seçimini değiştir.
- Yukarı/aşağı düğmeleriyle sıralamayı değiştir.
- Bir yazıyı başka kategoriye bağla.
- Kategoriyi sil; bağlı yazının "Kategorisiz" kaldığını doğrula.

