Exit code: 0
Wall time: 2.3 seconds
Output:
# İzlek blog MVP mimarisi

## Bilgi mimarisi ve sayfa ağacı

- `/`: Editoryal ana sayfa; öne çıkan yazı, son yazılar, konu girişleri.
- `/yazilar/[slug]`: Standart yazı şablonu; başlık, özet, yazar, tarih, okuma süresi, içindekiler ve gövde.
- İlk faz sonrası: `/konular/[slug]`, `/etiketler/[slug]`, `/yazarlar/[slug]`, `/arama`, `/hakkinda`.

## İçerik modeli

`Post`: başlık, slug, kısa özet, gövde, kapak görseli ve alt metni, yazar, yayın durumu, yayın tarihi, güncelleme tarihi, okuma süresi, birincil kategori, etiketler, öne çıkarma sırası ve SEO alanları.

`Category`: ad, slug, açıklama, sıra ve tema rengi. Her yazının yalnızca bir birincil kategorisi olmalı.

`Tag`: ad ve slug. Etiketler yatay ve kontrollü bir sözlükten seçilmeli; aynı anlamdaki çoğaltmalar engellenmeli.

`Author`: ad, slug, kısa biyografi, fotoğraf ve sosyal bağlantılar.

## Taksonomi kuralları

- Kategoriler ana navigasyon ve arşiv yapısını belirler; başlangıçta 4–6 adet tutulur.
- Etiketler ayrıntılı keşif içindir; yazı başına 2–5 etiket önerilir.
- Slug değişikliklerinde kalıcı yönlendirme kaydı zorunludur.
- Silinen kategori veya etiketler içerikten koparılmadan önce başka bir terimle birleştirilir.

## SEO alanları

SEO başlığı, meta açıklama, canonical URL, paylaşım başlığı/açıklaması/görseli, indeksleme seçeneği ve yapılandırılmış veri girdileri. Varsayılanlar içerikten otomatik üretilir; editör gerektiğinde geçersiz kılabilir.

## Admin / CMS gereksinimleri

- Roller: yönetici, editör, yazar.
- Taslak, incelemede, zamanlandı ve yayında durumları.
- Otomatik kayıt, önizleme, sürüm geçmişi, planlı yayın, görsel alt metni zorunluluğu ve SEO önizlemesi.
- Kategori/etiket yönetimi, slug çakışma kontrolü, kırık bağlantı uyarısı ve yönlendirme kaydı.
- MVP'de içerik dosya tabanlı tutulabilir; CMS bağlanırken sunum katmanı değişmeden içerik adaptörü eklenir.

## Modüler büyüme sınırları

Sunum, içerik erişimi ve özellik modülleri ayrıdır. Gelecekte üyelik/kimlik, bülten aboneliği ve AI destekleri bağımsız modüller olarak eklenir. İlk fazda bu özellikler için kullanıcı arayüzü, veri tabanı veya yarım çalışan akış bulunmaz.

